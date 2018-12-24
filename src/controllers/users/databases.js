const rfr = require('rfr');

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .populate('databases')
            .then((user) => {
                if (user) {
                    let databases = user.databases.map((x, i) => {
                        return {
                            no: i,
                            _id: x._id,
                            name: x.name,
                            dbType: x.dbType,
                            pass: x.pass,
                            blocked: x.conf.blocked,
                        };
                    });
                    res.json({
                        status: true,
                        data: databases
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