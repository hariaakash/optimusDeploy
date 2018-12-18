const rfr = require('rfr');
const bcrypt = require('bcryptjs');
const hat = require('hat');

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.email && req.body.key && req.body.password) {
        User.findOne({
                email: req.body.email,
                'conf.pToken': req.body.key
            })
            .then((user) => {
                if (user) {
                    if (req.body.password.length >= 8) {
                        bcrypt.hash(req.body.password, 10)
                            .then((hash) => {
                                user.password = hash;
                                user.conf.pToken = hat();
                                user.conf.setPassword = true;
                                user.logs.push({
                                    ip: req.clientIp,
                                    msg: 'Password changed.'
                                });
                                user.save();
                                uniR(res, true, 'Password changed successfully.');
                            });
                    } else {
                        uniR(res, false, 'Password criteria not met.');
                    }
                } else {
                    uniR(res, false, 'Account not found.');
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