const rfr = require('rfr');

const Admin = rfr('src/models/admins');
const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.adminKey && req.body.userId && req.body.serviceId && req.body.limit) {
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
                                if (req.body.limit >= 0) {
                                    if (req.body.serviceId == 1) {
                                        if (user.conf.limit.containers == req.body.limit) {
                                            uniR(res, false, 'User Container limit unable to change.');
                                        } else {
                                            admin.logs.push({
                                                ip: req.clientIp,
                                                msg: `Container Limit changed for user: ${user.email} from ${user.conf.limit.containers} to ${req.body.limit}`
                                            });
                                            admin.save();
                                            user.conf.limit.containers = req.body.limit;
                                            user.save();
                                            uniR(res, true, 'User Container limit changed.');
                                        }
                                    } else if (req.body.serviceId == 2) {
                                        if (user.conf.limit.databases == req.body.limit) {
                                            uniR(res, false, 'User DB limit unable to change.');
                                        } else {
                                            admin.logs.push({
                                                ip: req.clientIp,
                                                msg: `DB Limit changed for user: ${user.email} from ${user.conf.limit.databases} to ${req.body.limit}`
                                            });
                                            admin.save();
                                            user.conf.limit.databases = req.body.limit;
                                            user.save();
                                            uniR(res, true, 'User DB limit changed.');
                                        }
                                    } else {
                                        uniR(res, false, 'Service ID invalid.');
                                    }
                                } else {
                                    uniR(res, false, 'Limit should be >=0');
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