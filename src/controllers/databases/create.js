const rfr = require('rfr');
const async = require('async');
const mongoose = require('mongoose');
const randomatic = require('randomatic');

const User = rfr('src/models/users');
const Database = rfr('src/models/databases');

const DB = rfr('src/helpers/database');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

randomatic.isCrypto;

const request = (req, res) => {
    if (req.body.authKey && req.body.name && req.body.dbType) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then((user) => {
                if (user) {
                    async.series({
                        validateName: (callback) => {
                            if (user.conf.block) {
                                callback('accountBlocked', 'Account blocked from access.');
                            } else {
                                if (user.databases.length < user.conf.limit.databases) {
                                    if (req.body.name.length >= 4) {
                                        if (/^[\w\-\s]+$/.test(req.body.name)) {
                                            callback(null, 'Domain looks good.');
                                        } else {
                                            callback('validateName', 'Name can be alphanumeric and can contain hyphen, underscore and spaces.');
                                        }
                                    } else {
                                        callback('validateName', 'Name should atleast be of 4 characters.');
                                    }
                                } else {
                                    callback('databaseLimit', 'You have reached the limit.');
                                }
                            }
                        },
                        makeDB: (callback) => {
                            req.body.data = {
                                dbType: req.body.dbType,
                                user: mongoose.Types.ObjectId(),
                                pass: randomatic('Aa0', 12),
                            };
                            DB.create(req.body.data, callback);
                        },
                        saveData: (callback) => {
                            var data = new Database();
                            data._id = req.body.data.user;
                            data.name = req.body.name;
                            data.dbType = req.body.dbType;
                            data.pass = req.body.data.pass;
                            data.save();
                            user.databases.push(data._id);
                            user.logs.push({
                                ip: req.clientIp,
                                msg: `DB created with id: ${data._id} and name: ${req.body.name}`
                            });
                            user.save();
                            callback();
                        },
                    }, (err, result) => {
                        if (err) {
                            if (err == 'validateName') {
                                uniR(res, false, result.validateName);
                            } else if (err == 'accountBlocked') {
                                Log.error(`Account accessed using api: ${user.email}`);
                                uniR(res, false, result.validateName);
                            } else if (err == 'databaseLimit') {
                                Log.error(`Database limit accessed using api: ${user.email}`);
                                uniR(res, false, result.validateName);
                            } else if (err == 'dbNotFound') {
                                uniR(res, false, result.makeDB)
                            } else {
                                Log.error(err);
                                uniR(res, false, 'A fatal error caused the creation of database to abort.');
                            }
                        } else {
                            Log.info(`DB created with id: ${req.body.databaseId}`);
                            uniR(res, true, 'DB created successfully.');
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