const rfr = require('rfr');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const hat = require('hat');

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
                    res.json({
                        status: true,
                        msg: 'Logged in successfully',
                        authKey: user.authKey
                    });
                }
            })
            .catch((err) => {
                console.log(err)
                uniR(res, false, 'Some error occurred.');
            });
    } else {
        uniR(res, false, 'Empty input.');
    }
};

module.exports = request;