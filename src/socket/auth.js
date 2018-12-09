const rfr = require('rfr');

const User = rfr('src/models/users');

const Auth = (socket, next) => {
    if (socket.handshake.query.authKey) {
        User.findOne({
                authKey: socket.handshake.query.authKey
            })
            .populate('containers')
            .select('email containers')
            .then((user) => {
                socket.data = {
                    user: user
                };
                return next();
            })
            .catch((err) => {
                next(new Error('Forbidden'));
            });
    } else {
        next(new Error('Forbidden'));
    }
};

module.exports = Auth;