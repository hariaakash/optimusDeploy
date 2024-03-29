const rfr = require('rfr');

const Admin = rfr('src/models/admins');
const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then((admin) => {
                if (admin) {
                    User.find()
                        .then((users) => {
                            let verified = 0,
                                blocked = 0,
                                containers = 0,
                                databases = 0,
                                data = users.map((x, i) => {
                                    if (x.conf.verified) verified++;
                                    if (x.conf.block) blocked++;
                                    containers += x.containers.length;
                                    databases += x.databases.length;
                                    return {
                                        no: i,
                                        _id: x._id,
                                        email: x.email,
                                        conf: {
                                            verified: x.conf.verified,
                                            block: x.conf.block,
                                            limit: x.conf.limit,
                                        },
                                        containers: x.containers.length,
                                        databases: x.databases.length,
                                    };
                                });
                            res.json({
                                status: true,
                                data: {
                                    verified,
                                    blocked,
                                    containers,
                                    databases,
                                    users: data,
                                },
                            });
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