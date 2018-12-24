const rfr = require('rfr');

const Admin = rfr('src/models/admins');
const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.adminKey && req.params.userId) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then((admin) => {
                if (admin) {
                    User.findOne({
                            _id: req.params.userId
                        })
                        .then((user) => {
                            if (user) {
                                let logs = user.logs.reverse().slice(0, 30).map((x, i) => {
                                    return {
                                        no: i,
                                        msg: x.msg,
                                        date: x.created_at,
                                    };
                                });
                                res.json({
                                    status: true,
                                    data: {
                                        _id: user._id,
                                        email: user.email,
                                        conf: {
                                            verified: user.conf.verified,
                                            block: user.conf.block,
                                            limit: user.conf.limit,
                                        },
                                        containers: user.containers.length,
                                        databases: user.databases.length,
                                        logs: logs,
                                    }
                                });
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