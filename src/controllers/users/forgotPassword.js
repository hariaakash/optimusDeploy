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
                    user.conf.pToken = hat();
                    user.save();
                    uniR(res, true, 'Password reset link, send to registered email !!');
                    var request = sg.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: {
                            template_id: 'd-f9b46d8401b34de09cf4eccd6ac1af91',
                            personalizations: [{
                                to: [{
                                    email: user.email
                                }],
                                dynamic_template_data: {
                                    subject: 'Forgot Password Request - Optimus Deploy',
                                    body: 'Forgot Password Request',
                                    email: user.email,
                                    url: `${config.dashboard.user}setPassword?email=${encodeURIComponent(user.email)}&key=${user.conf.pToken}`
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