const rfr = require('rfr');

const Admin = rfr('src/models/admins');
const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.adminKey && req.body.userId) {
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
                                if (user.conf.block) {
                                    uniR(res, false, 'User already blocked.');
                                } else {
                                    user.conf.block = true;
                                    user.save();
                                    admin.logs.push({
                                        ip: req.clientIp,
                                        msg: `Blocked user: ${user.email}`
                                    });
                                    admin.save();
                                    uniR(res, true, 'User acces blocked.');
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