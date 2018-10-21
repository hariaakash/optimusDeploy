const rfr = require('rfr');
const bcrypt = require('bcryptjs');
const hat = require('hat');
const sg = require('sendgrid')('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');

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
                            user.save()
                                .then((user) => {
                                    uniR(res, true, 'Registration successfull, check email for verification.');
                                    var request = sg.emptyRequest({
                                        method: 'POST',
                                        path: '/v3/mail/send',
                                        body: {
                                            template_id: 'd-c0af209ac1444f7ab54ef101704a524a',
                                            personalizations: [{
                                                to: [{
                                                    email: user.email
                                                }],
                                                dynamic_template_data: {
                                                    subject: 'Welcome to Optimus Deploy ! Confirm Your Email',
                                                    body: 'Welcome to Optimus Deploy',
                                                    email: user.email,
                                                    url: 'https://optimuscp.io/dashboard/#!/verifyEmail?email=' + encodeURIComponent(req.body.email) + '&key=' + user.conf.verified
                                                }
                                            }],
                                            from: {
                                                name: 'Optimus Deploy',
                                                email: 'support@optimuscp.io'
                                            }
                                        }
                                    });
                                    sg.API(request);
                                });
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