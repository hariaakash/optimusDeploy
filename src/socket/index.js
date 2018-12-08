const rfr = require('rfr');

const config = rfr('config');

const Socket = (io) => {
    io.on('connection', function (client) {
        console.log('a user connected');
        client.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
};

module.exports = Socket;