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
                                let containers = user.containers.map((x, i) => {
                                    return {
                                        no: i,
                                        _id: x._id,
                                        conf: x.conf,
                                        image: x.image,
                                        name: x.name,
                                        nameCustom: x.nameCustom,
                                        stats: {
                                            cpu: -1,
                                            ram: -1,
                                            rom: -1,
                                        },
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