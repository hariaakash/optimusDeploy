const rfr = require('rfr');
const async = require('async');
const mongoose = require('mongoose');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

const config = rfr('config');

const Docker = rfr('src/helpers/container');
const Volume = rfr('src/helpers/volume');
const Git = rfr('src/helpers/git');
const Dns = rfr('src/helpers/dns');
const Nginx = rfr('src/helpers/nginx');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.authKey && req.body.name && typeof req.body.nameCustom == "boolean" && req.body.stack && req.body.git && req.body.deployKeys) {
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
                                    if (req.body.nameCustom) {
                                        if (/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/.test(req.body.name)) {
                                            callback(null, 'Domain looks good.');
                                        } else {
                                            callback('validateName', 'Domain not valid');
                                        }
                                    } else {
                                        if (req.body.name.length >= 6) {
                                            if (/^[a-z-]+$/.test(req.body.name)) {
                                                callback(null, 'Domain looks good.');
                                            } else {
                                                callback('validateName', 'Domain should be lowercase and alphabetic.');
                                            }
                                        } else {
                                            callback('validateName', 'Custom domain should atleast be of 6 characters.');
                                        }
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
                                    req.body.domain = req.body.nameCustom ? req.body.name : `${req.body.name}.${config.cloudflare.domain}`;
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
                            if (req.body.nameCustom) {
                                callback(null, 'Check DNS aborted due to custom domain.')
                            } else {
                                Dns.checkDns(req.body.name, callback);
                            }
                        }],
                        createVolume: ['checkContainer', 'checkDns', (result, callback) => {
                            req.body.containerDbId = mongoose.Types.ObjectId();
                            Volume.create(req.body.containerDbId, callback);
                        }],
                        createKey: ['checkContainer', 'checkDns', (result, callback) => {
                            Git.writeKey({
                                name: req.body.containerDbId,
                                key: req.body.deployKeys
                            }, callback);
                        }],
                        gitClone: ['createVolume', 'createKey', (result, callback) => {
                            Git.clone({
                                name: req.body.containerDbId,
                                git: req.body.git
                            }, callback);
                        }],
                        createContainer: ['gitClone', (result, callback) => {
                            Docker.createContainer({
                                name: String(req.body.containerDbId),
                                stack: req.body.stack
                            }, callback);
                        }],
                        startContainer: ['createContainer', (result, callback) => {
                            req.body.containerId = result.createContainer;
                            Docker.startContainer(req.body.containerId, callback);
                        }],
                        inspectPort: ['startContainer', (result, callback) => {
                            Docker.inspectPort(req.body.containerId, callback);
                        }],
                        createDns: ['inspectPort', (result, callback) => {
                            if (req.body.nameCustom) {
                                callback(null, '');
                            } else {
                                Dns.createDns(req.body.name, callback);
                            }
                        }],
                        createNginx: ['inspectPort', (result, callback) => {
                            req.body.containerPort = result.inspectPort;
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
                            container.nameCustom = req.body.nameCustom;
                            container.image = req.body.stack;
                            container.git = req.body.git;
                            container.port = req.body.containerPort;
                            container.containerId = req.body.containerId;
                            container.dnsId = req.body.dnsId;
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
                                    removeKeys: (callback) => {
                                        Git.removeKey(req.body.containerDbId, callback);
                                    },
                                }, (err) => {
                                    if (err) Log.error(err);
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