const rfr = require('rfr');

const User = rfr('src/models/users');

const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .populate('containers')
            .then((user) => {
                if (user) {
                    let containers = user.containers.map((x, i) => {
                        return {
                            no: i,
                            _id: x._id,
                            image: x.image,
                            name: x.name,
                            nameCustom: x.nameCustom,
                            stats: {
                                cpu: -1,
                                ram: -1,
                                rom: -1,
                            },
                        };
                    });
                    res.json({
                        status: true,
                        data: containers
                    });
                } else {
                    uniR(res, true, 'Session expired, login to continue.');
                }
            })
            .catch((err) => {
                uniR(res, false, 'Some error occurred.');
            });
    } else {
        uniR(res, false, 'Login to continue.');
    }
};

module.exports = request;