const rfr = require('rfr');
const bcrypt = require('bcryptjs');

const Admin = rfr('src/models/admins');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.adminKey && req.body.oldPassword && req.body.newPassword) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then((admin) => {
                if (admin) {
                    if (req.body.newPassword.length >= 8) {
                        bcrypt.compare(req.body.oldPassword, admin.password)
                            .then((status) => {
                                if (status) {
                                    bcrypt.hash(req.body.newPassword, 10)
                                        .then((hash) => {
                                            admin.password = hash;
                                            admin.logs.push({
                                                ip: req.clientIp,
                                                msg: 'Password changed.'
                                            });
                                            admin.save();
                                            uniR(res, true, 'Password changed successfully.');
                                        });
                                } else {
                                    uniR(res, false, 'Old password is wrong.');
                                }
                            });
                    } else {
                        uniR(res, false, 'Password criteria not met.');
                    }
                } else {
                    uniR(res, false, 'Session expired, login to continue.');
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