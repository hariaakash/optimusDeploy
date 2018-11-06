const rfr = require('rfr');
const hat = require('hat');

const Admin = rfr('src/models/admins');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then((admin) => {
                if (admin) {
                    admin.adminKey = hat();
                    admin.logs.push({
                        ip: req.clientIp,
                        msg: 'Logged out.'
                    });
                    admin.save();
                    res.json({
                        status: true,
                        msg: 'Logged out successfully.'
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