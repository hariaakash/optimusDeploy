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
                        .populate('containers')
                        .then((user) => {
                            if (user) {
                                let containers = user.containers.map((x, i) => {
                                    return {
                                        no: i,
                                        _id: x._id,
                                        name: x.name,
                                        image: x.image,
                                        dns: x.dns,
                                        conf: x.conf,
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
                                        containers: containers,
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