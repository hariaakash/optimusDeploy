const rfr = require('rfr');
const async = require('async');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

const Docker = rfr('src/helpers/container');
const Volume = rfr('src/helpers/volume');
const Dns = rfr('src/helpers/dns');
const Nginx = rfr('src/helpers/nginx');
const Git = rfr('src/helpers/git');
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
                                            req.body.dnsId = container.dnsId;
                                            container.remove();
                                            user.containers = user.containers.filter((x) => {
                                                return x != req.body.containerId;
                                            });
                                            user.logs.push({
                                                ip: req.clientIp,
                                                msg: `Container deleted with id: ${container._id} and name: ${container.name}`
                                            });
                                            user.save();
                                            callback(null, 'Data removed from DB');
                                        } else {
                                            callback('checkContainer', 'Container not found.');
                                        }
                                    } else {
                                        callback('checkContainer', 'Container not found.');
                                    }
                                })
                                .catch((err) => {
                                    callback(err, 'Some error occurred when trying to check existing container.');
                                });
                        }],
                        deleteContainer: ['checkContainer', (result, callback) => {
                            Docker.deleteContainer(req.body.dockerId, callback);
                        }],
                        deleteDns: ['checkContainer', (result, callback) => {
                            Dns.deleteDns(req.body.dnsId, callback);
                        }],
                        removeVolume: ['checkContainer', (result, callback) => {
                            Volume.remove(req.body.containerId, callback);
                        }],
                        removeKey: ['checkContainer', (result, callback) => {
                            Git.removeKey(req.body.containerId, callback);
                        }],
                        deleteNginx: ['checkContainer', (result, callback) => {
                            Nginx.deleteFile(req.body.containerId, callback);
                        }],
                        reloadNginx: ['deleteNginx', 'removeKey', 'removeVolume', 'deleteDns', 'deleteContainer', (result, callback) => {
                            Nginx.reload(callback);
                        }],
                    }, (err, result) => {
                        if (err) {
                            if (err == 'checkContainer') {
                                uniR(res, false, result.checkContainer);
                            } else {
                                Log.error(err);
                                uniR(res, false, 'A fatal error caused the deletion of container to abort.');
                            }
                        } else {
                            Log.info(`Container removed with id: ${req.body.containerId}`);
                            uniR(res, true, 'Container Removed successfully.');
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