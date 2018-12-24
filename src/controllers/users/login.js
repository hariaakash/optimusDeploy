const rfr = require('rfr');
const bcrypt = require('bcryptjs');

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.email && req.body.password) {
        User.findOne({
                email: req.body.email.toLowerCase()
            })
            .then((user) => {
                if (!user) {
                    uniR(res, false, 'User not registered.');
                } else {
                    if (!user.conf.setPassword) {
                        uniR(res, false, 'You have registered using social login, hence set password using forgot password.');
                    } else {
                        bcrypt.compare(req.body.password, user.password)
                            .then((status) => {
                                if (status) {
                                    if (user.conf.verified == 'true') {
                                        user.logs.push({
                                            ip: req.clientIp,
                                            msg: 'Logged in.'
                                        });
                                        res.json({
                                            status: true,
                                            msg: 'Logged in successfully',
                                            authKey: user.authKey
                                        });
                                    } else {
                                        uniR(res, false, 'Verify your account to login !!');
                                    }
                                } else {
                                    uniR(res, false, 'Password is wrong.');
                                }
                            });
                    }
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