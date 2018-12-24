const rfr = require('rfr');

const User = rfr('src/models/users');

const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.authKey && req.body.containerId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .populate('containers')
            .then((user) => {
                if (user) {
                    if ((x = user.containers.findIndex(y => y._id == req.body.containerId)) > -1) {
                        res.json({
                            status: true,
                            data: user.containers[x].conf.sftp,
                        });
                    } else {
                        uniR(res, false, 'Container not found.');
                    }
                } else {
                    uniR(res, true, 'Session expired, login to continue.');
                }
            })
            .catch((err) => {
                Log.error(err);
                uniR(res, false, 'Some error occurred.');
            });
    } else {
        uniR(res, false, 'Empty input.');
    }
};

module.exports = request;