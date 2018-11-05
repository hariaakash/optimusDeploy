const rfr = require('rfr');
const async = require('async');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

const Docker = rfr('src/helpers/container');
const Nginx = rfr('src/helpers/nginx');

const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.authKey && req.body.containerId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then((user) => {
                if (user) {
                    async.auto({
                        checkContainer: [(callback) => {
                            Container.findOne({
                                    _id: req.body.containerId
                                })
                                .then((container) => {
                                    if (container) {
                                        if (user.containers.indexOf(container._id) > -1) {
                                            req.body.dockerId = container.containerId;
                                            req.body.container = container;
                                            callback(null, 'Container found.');
                                        } else {
                                            callback('checkContainer', 'Container not found.');
                                        }
                                    } else {
                                        callback('checkContainer', 'Container not found.');
                                    }
                                })
                                .catch((err) => {
                                    Log.error(err);
                                    callback(err, 'Some error occurred when trying to check existing container.');
                                });
                        }],
                        restartContainer: ['checkContainer', (result, callback) => {
                            Docker.restartContainer(req.body.dockerId, callback);
                        }],
                        inspectPort: ['restartContainer', (result, callback) => {
                            Docker.inspectPort(req.body.containerId, callback);
                        }],
                        changePortNginx: ['inspectPort', (result, callback) => {
                            req.body.containerPort = result.inspectPort;
                            Nginx.changePort({
                                id: req.body.containerId,
                                oldPort: req.body.container.port,
                                newPort: req.body.containerPort
                            }, callback);
                        }],
                        reloadNginx: ['changePortNginx', (result, callback) => {
                            Nginx.reload(callback);
                        }],
                        saveData: ['changePortNginx', (result, callback) => {
                            req.body.container.port = req.body.containerPort;
                            req.body.container.save();
                            callback(null);
                        }],
                    }, (err, result) => {
                        if (err) {
                            if (err == 'checkContainer') {
                                uniR(res, false, result.checkContainer);
                            } else {
                                Log.error(err);
                                uniR(res, false, 'Unable to restart the container.');
                            }
                        } else {
                            uniR(res, true, 'Container Re-started.');
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