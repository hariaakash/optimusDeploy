const rfr = require('rfr');
const hat = require('hat');

const config = rfr('config');

const sg = require('sendgrid')(config.sendgrid);

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.email) {
        User.findOne({
                email: req.body.email
            })
            .then((user) => {
                if (user) {
                    if (user.conf.verified != 'true') {
                        user.conf.verified = hat();
                        user.save();
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
                    } else {
                        uniR(res, false, 'Account already verified.');
                    }
                } else {
                    uniR(res, false, 'Account not found / already verified.');
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