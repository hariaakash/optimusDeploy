const rfr = require('rfr');
const async = require('async');
const randomatic = require('randomatic');

const User = rfr('src/models/users');
const Database = rfr('src/models/databases');

const DB = rfr('src/helpers/database');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

randomatic.isCrypto;

const request = (req, res) => {
    if (req.body.authKey && req.body.databaseId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then((user) => {
                if (user) {
                    async.series({
                        checkDatabase: (callback) => {
                            Database.findOne({
                                    _id: req.body.databaseId
                                })
                                .then((db) => {
                                    if (db) {
                                        if (user.databases.indexOf(db._id) > -1) {
                                            req.body.dbType = db.dbType;
                                            req.body.pass = randomatic('Aa0', 12);
                                            db.pass = req.body.pass;
                                            db.save();
                                            user.logs.push({
                                                ip: req.clientIp,
                                                msg: `DB password reset with id: ${db._id} and name: ${db.name}`
                                            });
                                            user.save();
                                            callback(null, 'Data saved to DB');
                                        } else {
                                            callback('checkDatabase', 'Database not found.');
                                        }
                                    } else {
                                        callback('checkDatabase', 'Database not found.');
                                    }
                                })
                                .catch((err) => {
                                    callback(err, 'Some error occurred when trying to check existing container.');
                                });
                        },
                        resetDB: (callback) => {
                            DB.reset({
                                dbType: req.body.dbType,
                                user: req.body.databaseId,
                                pass: req.body.pass,
                            }, callback);
                        },
                    }, (err, result) => {
                        if (err) {
                            if (err == 'checkDatabase') {
                                uniR(res, false, result.checkDatabase)
                            } else if (err == 'resetDB') {
                                uniR(res, false, result.resetDB);
                            } else {
                                uniR(res, false, 'Unable to reset DB password.');
                            }
                        } else {
                            Log.info(`DB password reset with id: ${req.body.databaseId}`);
                            uniR(res, true, 'DB password reset successfully.');
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