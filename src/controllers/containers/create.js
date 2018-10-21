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
                        createContainer: ['checkContainer', (result, callback) => {
                            Docker.createContainer({
                                git: req.body.git,
                                name: req.body.name,
                                stack: req.body.stack
                            }, callback);
                        }],
                        startContainer: ['createContainer', (result, callback) => {
                            Docker.startContainer(req.body.cid = result.createContainer, callback);
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
                        createDNS: ['createNginx', (result, callback) => {
                            Dns.createDns(req.body.name, callback);
                        }],
                        reloadNginx: ['createDNS', (result, callback) => {
                            Nginx.reload(callback);
                        }],
                        saveData: ['reloadNginx', (result, callback) => {
                            var container = new Container();
                            container._id = mongoose.Types.ObjectId();
                            container.name = req.body.name;
                            container.image = req.body.stack;
                            container.git = req.body.git;
                            container.cid = req.body.cid;
                            container.save();
                            user.containers.push(container._id);
                            user.save();
                            callbac(null);
                        }],
                    }, (err, result) => {
                        if (err) {
                            if (err == 'checkContainer') {
                                uniR(res, false, result.checkContainer);
                            } else if (err == 'qq') {
                                uniR(res, false, result.checkContainer);
                            } else {
                                Log.error(err);
                                uniR(res, false, 'A fatal error caused the creation of container to abort.');
                            }
                        } else {
                            Log.info(`Container created with name: ${result.createContainer}`);
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