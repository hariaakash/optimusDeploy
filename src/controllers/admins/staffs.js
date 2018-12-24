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
                    Admin.find()
                        .then((admins) => {
                            let data = admins.map((x, i) => {
                                let logs = x.logs.reverse().slice(0, 30).map((y, i) => {
                                    return {
                                        no: i,
                                        msg: y.msg,
                                        date: y.created_at,
                                    };
                                });
                                return {
                                    no: i,
                                    _id: x._id,
                                    email: x.email,
                                    conf: {
                                        block: x.conf.block,
                                    },
                                    logs: logs,
                                };
                            });
                            res.json({
                                status: true,
                                data,
                            });
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