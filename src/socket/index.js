const rfr = require('rfr');

const auth = rfr('src/socket/auth');
const containerStats = rfr('src/socket/containerStats');
const containerLogs = rfr('src/socket/containerLogs');

const Socket = (io) => {

    io.use(auth);

    io.on('connection', (client) => {
        console.log(`User connected with authKey: ${client.data.user.email}`);

        client.on('containerStats', (data) => containerStats(data, client));

        client.on('containerLogs', (data) => containerLogs(data, client));

        client.on('disconnect', () => {
            console.log(`User disconnected with authKey: ${client.data.user.email}`);
        });
    });
};

module.exports = Socket;