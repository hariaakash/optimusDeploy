const rfr = require('rfr');
const async = require('async');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

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
                                            callback(null, 'Container found.');
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
                        gitPull: ['checkContainer', (result, callback) => {
                            Git.pull(req.body.containerId, callback);
                        }],
                    }, (err, result) => {
                        if (err) {
                            if (err == 'checkContainer') {
                                uniR(res, false, result.checkContainer);
                            } else {
                                Log.error(err);
                                uniR(res, false, 'Unable to stop the container, try kill.');
                            }
                        } else {
                            uniR(res, true, result.gitPull);
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