const rfr = require('rfr');
const randomatic = require('randomatic');

const User = rfr('src/models/users');

const Sftp = rfr('src/helpers/sftp');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

randomatic.isCrypto;

const request = (req, res) => {
    if (req.body.authKey && req.body.containerId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .populate('containers')
            .then((user) => {
                if (user) {
                    if ((x = user.containers.findIndex(y => y._id == req.body.containerId)) > -1) {
                        let pass = randomatic('Aa0', 12);
                        Sftp.resetUserPass({
                            name: req.body.containerId,
                            pass,
                        }, (err, data) => {
                            if (err) {
                                Log.error(err);
                                uniR(res, false, data);
                            } else {
                                user.containers[x].conf.sftp = pass;
                                user.containers[x].save();
                                user.logs.push({
                                    ip: req.clientIp,
                                    msg: `Container password reset with id: ${req.body.containerId} and name: ${user.containers[x].name}`
                                });
                                uniR(res, true, data);
                            }
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