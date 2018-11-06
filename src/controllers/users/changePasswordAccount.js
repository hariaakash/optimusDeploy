const rfr = require('rfr');
const bcrypt = require('bcryptjs');
const hat = require('hat');
const sg = require('sendgrid')('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');

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.authKey && req.body.oldPassword && req.body.newPassword) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then((user) => {
                if (user) {
                    if (req.body.newPassword.length >= 8) {
                        bcrypt.compare(req.body.oldPassword, user.password)
                            .then((status) => {
                                if (status) {
                                    bcrypt.hash(req.body.newPassword, 10)
                                        .then((hash) => {
                                            user.password = hash;
                                            user.logs.push({
                                                ip: req.clientIp,
                                                msg: 'Password changed.'
                                            });
                                            user.save();
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