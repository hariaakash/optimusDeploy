const rfr = require('rfr');

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then((user) => {
                if (user) {
                    let logs = user.logs.reverse().slice(0, 30).map((x, i) => {
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