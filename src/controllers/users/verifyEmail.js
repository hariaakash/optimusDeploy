const rfr = require('rfr');

const config = rfr('config');

const sg = require('sendgrid')(config.sendgrid);

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.email && req.body.key) {
        User.findOne({
                email: req.body.email.toLowerCase(),
                'conf.verified': req.body.key
            })
            .then((user) => {
                if (user) {
                    user.conf.verified = 'true';
                    user.logs.push({
                        ip: req.clientIp,
                        msg: 'Email verification completed.'
                    });
                    user.save();
                    uniR(res, true, 'Successfully verified, login to continue!');
                    var request = sg.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: {
                            template_id: 'd-f57e69c8780948fdb2206a4a0d5a634b',
                            personalizations: [{
                                to: [{
                                    email: user.email
                                }],
                                dynamic_template_data: {
                                    subject: 'Your Optimus Deploy account has been provisioned!',
                                    body: 'Account Activated',
                                    email: user.email,
                                    url: 'https://optimuscp.io/dashboard/#!/login'
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
                    uniR(res, true, 'User not found.');
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