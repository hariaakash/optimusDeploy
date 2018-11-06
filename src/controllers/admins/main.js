const rfr = require('rfr');

const Admin = rfr('src/models/admins');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then((admin) => {
                if (admin) {
                    res.json({
                        status: true,
                        data: {
                            email: admin.email,
                            conf: {
                                block: admin.conf.block,
                            },
                        }
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