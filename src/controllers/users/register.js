const rfr = require('rfr');
const bcrypt = require('bcryptjs');
const hat = require('hat');

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.email && req.body.password) {
        User.findOne({
                email: req.body.email
            })
            .then((checkUser) => {
                if (checkUser) {
                    uniR(res, false, 'User already registered.');
                } else {
                    bcrypt.hash(req.body.password, 10)
                        .then((hash) => {
                            var user = new User();
                            user.email = req.body.email.toLowerCase();
                            user.password = hash;
                            user.conf.verified = hat();
                            user.authKey = hat();
                            user.save();
                            uniR(res, true, 'Registration successfull, check email for verification.');
                        })
                        .catch((err) => {
                            uniR(res, false, 'Some error occurred.');
                        });
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