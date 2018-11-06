const rfr = require('rfr');
const bcrypt = require('bcryptjs');

const Admin = rfr('src/models/admins');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.email && req.body.password) {
        Admin.findOne({
                email: req.body.email.toLowerCase()
            })
            .then((admin) => {
                if (!admin) {
                    uniR(res, false, 'Admin not registered.');
                } else {
                    bcrypt.compare(req.body.password, admin.password)
                        .then((status) => {
                            if (status) {
                                admin.logs.push({
                                    ip: req.clientIp,
                                    msg: 'Logged in.'
                                });
                                res.json({
                                    status: true,
                                    msg: 'Logged in successfully',
                                    adminKey: admin.adminKey
                                });
                            } else {
                                uniR(res, false, 'Password is wrong.');
                            }
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