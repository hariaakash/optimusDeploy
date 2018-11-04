const rfr = require('rfr');
const hat = require('hat');

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then((user) => {
                if (user) {
                    user.authKey = hat();
                    user.logs.push({
                        ip: req.clientIp,
                        msg: 'Logged out.'
                    });
                    user.save();
                    res.json({
                        status: true,
                        msg: 'Logged out successfully.'
                    });
                } else {
                    uniR(res, true, 'Session expired, login to continue.');
                }
            })
            .catch((err) => {
                console.log(err)
                uniR(res, false, 'Some error occurred.');
            });
    } else {
        uniR(res, false, 'Login to continue.');
    }
};

module.exports = request;