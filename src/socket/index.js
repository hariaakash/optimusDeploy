const rfr = require('rfr');

const auth = rfr('src/socket/auth');
const containerStats = rfr('src/socket/containerStats');
const containerLogs = rfr('src/socket/containerLogs');
const containerTerminal = rfr('src/socket/containerTerminal');

const Socket = (io) => {

    io.use(auth);

    io.on('connection', (client) => {
        // console.log(`User connected with authKey: ${client.data.user.email}`);

        client.on('containerStats', (data) => containerStats(data, client));

        client.on('containerLogs', (data) => containerLogs(data, client));

        client.on('containerTerminal', (data) => containerTerminal(data, client));

        client.on('disconnect', () => {
            if (client.data.containerStats) client.data.containerStatsStream.destroy();
            if (client.data.containerLogs) client.data.containerLogsStream.destroy();
            // console.log(`User disconnected with authKey: ${client.data.user.email}`);
        });
    });
};

module.exports = Socket;