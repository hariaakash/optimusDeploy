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
                    res.json({
                        status: true,
                        data: {
                            email: user.email,
                            conf: {
                                verified: user.conf.verified,
                                block: user.conf.block,
                                setPassword: user.conf.setPassword,
                                limit: user.conf.limit,
                            },
                        }
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