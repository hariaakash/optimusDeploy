const rfr = require('rfr');

const Admin = rfr('src/models/admins');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.authKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then((admin) => {
                if (admin) {
                    let logs = admin.logs.reverse().slice(0, 30).map((x, i) => {
                        return {
                            no: i,
                            msg: x.msg,
                            date: x.created_at,
                        };
                    });
                    res.json({
                        status: true,
                        data: logs
                    });
                } else {
                    uniR(res, false, 'Session expired, login to continue.');
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