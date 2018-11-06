const rfr = require('rfr');
const hat = require('hat');

const config = rfr('config');

const sg = require('sendgrid')(config.sendgrid);

const Admin = rfr('src/models/admins');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.adminKey && req.body.email) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then((admin) => {
                if (admin) {
                    Admin.findOne({
                            email: req.body.email.toLowerCase()
                        })
                        .then((checkAdmin) => {
                            if (checkAdmin) {
                                uniR(res, false, 'Admin with email already exists.');
                            } else {
                                var newAdmin = new Admin();
                                newAdmin.email = req.body.email.toLowerCase();
                                newAdmin.adminKey = hat();
                                newAdmin.pToken = hat();
                                newAdmin.logs.push({
                                    ip: '::1',
                                    msg: 'Registerd.'
                                });
                                newAdmin.save();
                                admin.logs.push({
                                    ip: req.clientIp,
                                    msg: 'Registerd.'
                                });
                                admin.save();
                                uniR(res, true, 'Admin created.');
                                var request = sg.emptyRequest({
                                    method: 'POST',
                                    path: '/v3/mail/send',
                                    body: {
                                        template_id: 'd-f9b46d8401b34de09cf4eccd6ac1af91',
                                        personalizations: [{
                                            to: [{
                                                email: admin.email
                                            }],
                                            dynamic_template_data: {
                                                subject: 'Set Password Request for Admin - Optimus Deploy',
                                                body: 'Forgot Password Request - Admin',
                                                email: admin.email,
                                                url: `${config.dashboard.admin}setPassword?email=${encodeURIComponent(admin.email)}&key=${admin.conf.pToken}`
                                            }
                                        }],
                                        from: {
                                            name: 'Optimus Deploy',
                                            email: 'support@optimuscp.io'
                                        }
                                    }
                                });
                                sg.API(request);
                            }
                        })
                        .catch((err) => {
                            uniR(res, false, 'Some error occurred.');
                        });
                } else {
                    uniR(res, true, 'Session expired, login to continue.');
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