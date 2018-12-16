const rfr = require('rfr');
const async = require('async');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

const Git = rfr('src/helpers/git');

const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.authKey && req.body.containerId && req.body.repo && req.body.key) {
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
                                        if (user.containers.indexOf(req.body.containerId) > -1) {
                                            if (!container.git.enabled) {
                                                req.body.container = container;
                                                callback(null, 'Container found.');
                                            } else {
                                                callback('gitSet', 'Git is already set.');
                                            }
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
                        writeKey: ['checkContainer', (result, callback) => {
                            Git.writeKey({
                                name: req.body.containerId,
                                key: req.body.key,
                            }, callback);
                        }],
                        gitClone: ['writeKey', (result, callback) => {
                            Git.clone({
                                name: req.body.containerId,
                                git: req.body.git,
                            }, callback);
                        }],
                        saveData: ['gitClone', (result, callback) => {
                            req.body.container.git.repo = req.body.git;
                            req.body.container.git.enabled = true;
                            req.body.container.save();
                            user.logs.push({
                                ip: req.clientIp,
                                msg: `Container git set with id: ${req.body.containerId} and name: ${req.body.domain}`
                            });
                            user.save();
                            callback(null);
                        }],
                    }, (err, result) => {
                        if (err) {
                            if (err == 'checkContainer' || err == 'gitSet') {
                                uniR(res, false, result.checkContainer);
                            } else if (err == 'gitClone') {
                                uniR(res, false, result.gitClone);
                            } else {
                                Log.error(err);
                                uniR(res, false, 'Unable to fetch the repo.');
                            }
                        } else {
                            uniR(res, true, 'DNS Set.');
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