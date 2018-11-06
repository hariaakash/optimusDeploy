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
                            let data = users.map((x) => {
                                return {
                                    _id: x._id,
                                    email: x.email,
                                    conf: {
                                        verified: x.conf.verified,
                                        block: x.conf.block,
                                    },
                                    containers: x.containers.length,
                                };
                            });
                            res.json({
                                status: true,
                                data: data,
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