const rfr = require('rfr');
const async = require('async');
const mongoose = require('mongoose');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

const config = rfr('config');

const Docker = rfr('src/helpers/container');
const Git = rfr('src/helpers/git');
const Dns = rfr('src/helpers/dns');
const Nginx = rfr('src/helpers/nginx');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.authKey && req.body.name && typeof req.body.nameCustom == "boolean" && req.body.stack && req.body.git) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then((user) => {
                if (user) {
                    async.auto({
                        checkContainer: [(callback) => {
                            Container.findOne({
                                    name: req.body.name.toLowerCase()
                                })
                                .then((container) => {
                                    req.body.name = req.body.name.toLowerCase();
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
                        checkDns: [(callback) => {
                            if (req.body.nameCustom) {
                                next(null, 'Check DNS aborted due to custom domain.')
                            } else {
                                Dns.checkDns(req.body.name, callback);
                            }
                        }],
                        createVolume: ['checkContainer', 'checkDns', (result, callback) => {
                            req.body.containerDbId = mongoose.Types.ObjectId();
                            Docker.createVolume(req.body.containerDbId, callback);
                        }],
                        gitClone: ['createVolume', (result, callback) => {
                            Git.clone({
                                name: req.body.containerDbId,
                                git: req.body.git
                            }, callback);
                        }],
                        createContainer: ['createVolume', (result, callback) => {
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
                                next(null, 'DNS creation aborted due to custom domain.')
                            } else {
                                Dns.createDns(req.body.name, callback);
                            }
                        }],
                        createNginx: ['inspectPort', (result, callback) => {
                            req.body.containerPort = result.inspectPort;
                            Nginx.createFile({
                                id: req.body.containerDbId,
                                name: req.body.nameCustom ? req.body.name : `${req.body.name}.${config.cloudflare.domain}`,
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
                            user.save();
                            callback(null);
                        }],
                    }, (err, result) => {
                        if (err) {
                            if (err == 'checkContainer') {
                                uniR(res, false, result.checkContainer);
                            } else if (err == 'checkDns') {
                                uniR(res, false, result.checkDns);
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
                uniR(res, false, 'Some error occurred.');
            });
    } else {
        uniR(res, false, 'Empty input.');
    }
};

module.exports = request;