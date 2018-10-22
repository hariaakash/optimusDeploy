const rfr = require('rfr');
const async = require('async');
const mongoose = require('mongoose');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

const Docker = rfr('src/helpers/container');
const Dns = rfr('src/helpers/dns');
const Nginx = rfr('src/helpers/nginx');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.authKey && req.body.name && req.body.stack && req.body.git) {
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
                        checkDns: ['checkContainer', (result, callback) => {
                            Dns.checkDns(req.body.name, callback);
                        }],
                        createContainer: ['checkDns', (result, callback) => {
                            Docker.createContainer({
                                git: req.body.git,
                                name: req.body.name,
                                stack: req.body.stack
                            }, callback);
                        }],
                        startContainer: ['createContainer', (result, callback) => {
                            req.body.containerId = result.createContainer;
                            Docker.startContainer(result.createContainer, callback);
                        }],
                        inspectPort: ['startContainer', (result, callback) => {
                            Docker.inspectPort(result.startContainer, callback);
                        }],
                        createNginx: ['inspectPort', (result, callback) => {
                            Nginx.createFile({
                                name: req.body.name,
                                port: result.inspectPort
                            }, callback);
                        }],
                        createDns: ['createNginx', (result, callback) => {
                            Dns.createDns(req.body.name, callback);
                        }],
                        reloadNginx: ['createDns', (result, callback) => {
                            req.body.dnsId = result.createDns;
                            Nginx.reload(callback);
                        }],
                        saveData: ['reloadNginx', (result, callback) => {
                            var container = new Container();
                            container._id = mongoose.Types.ObjectId();
                            req.body.containerDbId = container._id;
                            container.name = req.body.name;
                            container.image = req.body.stack;
                            container.git = req.body.git;
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