const rfr = require('rfr');
const async = require('async');

const Admin = rfr('src/models/admins');
const User = rfr('src/models/users');

const Docker = rfr('src/helpers/container');
const Volume = rfr('src/helpers/volume');
const Log = rfr('src/helpers/logger');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.adminKey && req.body.userId && req.body.containerId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then((admin) => {
                if (admin) {
                    User.findOne({
                            _id: req.body.userId
                        })
                        .then((user) => {
                            if (user) {
                                if ((x = user.containers.findIndex(y => y._id == req.body.containerId)) > -1) {
                                    async.parallel({
                                        containerStats: (callback) => {
                                            Docker.containerStats(req.body.containerId, callback);
                                        },
                                        volumeStats: (callback) => {
                                            Volume.stats(req.body.containerId, callback);
                                        },
                                    }, (err, result) => {
                                        if (err) {
                                            Log.error(err);
                                            uniR(res, false, 'Error occurred when trying to retireve stats.');
                                        } else {
                                            let data = {
                                                _id: req.body.containerId,
                                                stats: {
                                                    rom: result.volumeStats,
                                                    ram: result.containerStats.ram,
                                                    cpu: result.containerStats.cpu,
                                                },
                                            };
                                            res.json({
                                                status: true,
                                                data,
                                            });
                                        }
                                    });
                                } else {
                                    uniR(res, false, 'Container not found.');
                                }
                            } else {
                                uniR(res, false, 'User not found.');
                            }
                        })
                        .catch((err) => {
                            uniR(res, false, 'Some error occurred.');
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