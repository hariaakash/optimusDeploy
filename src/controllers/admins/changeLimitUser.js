const rfr = require('rfr');

const Admin = rfr('src/models/admins');
const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.adminKey && req.body.userId && req.body.limit) {
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
                                    if (user.conf.limit == req.body.limit) {
                                        uniR(res, false, 'User limit unable to change.');
                                    } else {
                                        admin.logs.push({
                                            ip: req.clientIp,
                                            msg: `Container Limit changed for user: ${user.email} from ${user.conf.limit} to ${req.body.limit}`
                                        });
                                        admin.save();
                                        user.conf.limit = req.body.limit;
                                        user.save();
                                        uniR(res, true, 'User limit changed.');
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