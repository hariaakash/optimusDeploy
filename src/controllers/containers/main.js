const rfr = require('rfr');
const async = require('async');

const User = rfr('src/models/users');

const Docker = rfr('src/helpers/container');
const Volume = rfr('src/helpers/volume');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.query.authKey && req.query.containerId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .populate('containers')
            .then((user) => {
                if (user) {
                    if ((x = user.containers.findIndex(y => y._id == req.query.containerId)) > -1) {
                        let data = {
                            _id: user.containers[x]._id,
                            name: user.containers[x].name,
                            nameCustom: user.containers[x].nameCustom,
                            image: user.containers[x].image,
                            git: user.containers[x].git,
                            blocked: user.containers[x].conf.blocked,
                        };
                        res.json({
                            status: true,
                            data: data,
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