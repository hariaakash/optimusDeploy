const rfr = require('rfr');
const async = require('async');

const User = rfr('src/models/users');
const Database = rfr('src/models/databases');

const DB = rfr('src/helpers/database');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

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
                                            db.remove();
                                            user.databases = user.databases.filter((x) => {
                                                return x != req.body.databaseId;
                                            });
                                            user.logs.push({
                                                ip: req.clientIp,
                                                msg: `DB deleted with id: ${db._id} and name: ${db.name}`
                                            });
                                            user.save();
                                            callback(null, 'Data removed from DB');
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
                        deleteDB: (callback) => {
                            DB.drop({
                                dbType: req.body.dbType,
                                user: req.body.databaseId,
                            }, callback);
                        },
                    }, (err, result) => {
                        if (err) {
                            uniR(res, false, 'Unable to remove DB.');
                        } else {
                            Log.info(`DB removed with id: ${req.body.databaseId}`);
                            uniR(res, true, 'DB removed successfully.');
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