const rfr = require('rfr');
const async = require('async');
const mongoose = require('mongoose');
const randomatic = require('randomatic');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

const config = rfr('config');

const Docker = rfr('src/helpers/container');
const Volume = rfr('src/helpers/volume');
const Sftp = rfr('src/helpers/sftp');
const Git = rfr('src/helpers/git');
const Dns = rfr('src/helpers/dns');
const Nginx = rfr('src/helpers/nginx');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

randomatic.isCrypto;

const request = (req, res) => {
    if (req.body.authKey && req.body.name && req.body.stack) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then((user) => {
                if (user) {
                    async.auto({
                        validateName: [(callback) => {
                            if (user.conf.block) {
                                callback('accountBlocked', 'Account blocked from access.');
                            } else {
                                if (user.containers.length < user.conf.limit) {
                                    if (req.body.name.length >= 6) {
                                        if (/^[a-z-]+$/.test(req.body.name)) {
                                            callback(null, 'Domain looks good.');
                                        } else {
                                            callback('validateName', 'Domain should be lowercase and alphabetic.');
                                        }
                                    } else {
                                        callback('validateName', 'Domain name should atleast be of 6 characters.');
                                    }
                                } else {
                                    callback('containerLimit', 'You have reached the limit.');
                                }
                            }
                        }],
                        checkContainer: ['validateName', (result, callback) => {
                            Container.findOne({
                                    name: req.body.name
                                })
                                .then((container) => {
                                    if (container) {
                                        callback('checkContainer', 'Container name already taken.');
                                    } else {
                                        callback(null);
                                    }
                                })
                                .catch((err) => {
                                    callback(err, 'Some error occurred when trying to check existing container.');
                                });
                        }],
                        checkDns: ['validateName', (result, callback) => {
                            Dns.checkDns(req.body.name, callback);
                        }],
                        createSftp: ['validateName', (result, callback) => {
                            req.body.containerDbId = mongoose.Types.ObjectId();
                            req.body.sftpPass = randomatic('Aa0', 12);
                            Sftp.addUser({
                                name: req.body.containerDbId,
                                pass: req.body.sftpPass,
                            }, callback);
                        }],
                        createVolume: ['checkContainer', 'checkDns', 'createSftp', (result, callback) => {
                            Volume.create(req.body.containerDbId, callback);
                        }],
                        gitClone: ['createVolume', (result, callback) => {
                            Git.cloneInit({
                                name: req.body.containerDbId,
                                stack: req.body.stack
                            }, callback);
                        }],
                        createContainer: ['createVolume', 'createSftp', (result, callback) => {
                            Docker.createContainer({
                                name: String(req.body.containerDbId),
                                stack: req.body.stack
                            }, callback);
                        }],
                        startContainer: ['createContainer', 'gitClone', (result, callback) => {
                            req.body.containerId = result.createContainer;
                            Docker.startContainer(req.body.containerId, callback);
                        }],
                        inspectPort: ['startContainer', (result, callback) => {
                            Docker.inspectPort(req.body.containerId, callback);
                        }],
                        createDns: ['inspectPort', (result, callback) => {
                            Dns.createDns(req.body.name, callback);
                        }],
                        createNginx: ['inspectPort', (result, callback) => {
                            req.body.containerPort = result.inspectPort;
                            req.body.domain = `${req.body.name}.${config.cloudflare.domain}`;
                            Nginx.createFile({
                                id: req.body.containerDbId,
                                name: req.body.domain,
                                port: result.inspectPort
                            }, callback);
                        }],
                        reloadNginx: ['createNginx', (result, callback) => {
                            Nginx.reload(callback);
                        }],
                        saveData: ['reloadNginx', 'createDns', (result, callback) => {
                            req.body.dnsId = result.createDns;
                            var container = new Container();
                            container._id = req.body.containerDbId;
                            container.name = req.body.name;
                            container.image = req.body.stack;
                            container.port = req.body.containerPort;
                            container.containerId = req.body.containerId;
                            container.dnsId = req.body.dnsId;
                            container.conf.sftp = req.body.sftpPass;
                            container.save();
                            user.containers.push(container._id);
                            user.logs.push({
                                ip: req.clientIp,
                                msg: `Container created with id: ${container._id} and name: ${req.body.domain}`
                            });
                            user.save();
                            callback(null);
                        }],
                    }, (err, result) => {
                        if (err) {
                            if (err == 'validateName') {
                                uniR(res, false, result.validateName);
                            } else if (err == 'checkContainer') {
                                uniR(res, false, result.checkContainer);
                            } else if (err == 'checkDns') {
                                uniR(res, false, result.checkDns);
                            } else if (err == 'gitClone') {
                                async.parallel({
                                    removeVolume: (callback) => {
                                        Volume.remove(req.body.containerDbId, callback);
                                    },
                                    removeSftp: (callback) => {
                                        Sftp.delUser(req.body.containerDbId, callback);
                                    },
                                }, () => {
                                    Log.error(err);
                                    uniR(res, false, result.gitClone);
                                });
                            } else if (err == 'accountBlocked') {
                                Log.error(`Account accessed using api: ${user.email}`);
                                uniR(res, false, result.accountBlocked);
                            } else if (err == 'containerLimit') {
                                Log.error(`Container limit accessed using api: ${user.email}`);
                                uniR(res, false, result.containerLimit);
                            } else {
                                Log.error(err);
                                uniR(res, false, 'A fatal error caused the creation of container to abort.');
                            }
                        } else {
                            Log.info(`Container created with id: ${req.body.containerDbId}`);
                            uniR(res, true, 'Container Created successfully.');
                        }
                    });
                } else {
                    uniR(res, true, 'Session expired, login to continue.');
                }
            })
            .catch((err) => {
                Log.error(err);
                uniR(res, false, 'Some error occurred.');
            });
    } else {
        uniR(res, false, 'Empty input.');
    }
};

module.exports = request;