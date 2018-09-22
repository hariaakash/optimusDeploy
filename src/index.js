const rfr = require('rfr');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const config = rfr('config');
const Log = rfr('src/helpers/logger');
const DBConnection = rfr('src/helpers/mongoose');

Log.info('+ ------------------------------------ +');
Log.info('|          Optimus Deploy              |');
Log.info('+ ------------------------------------ +');
Log.info('Loading modules, this could take a few seconds.');

server.listen(config.web.port, config.web.ip);
Log.info(`Express running on ${config.web.ip}:${config.web.port}`);
DBConnection();
Log.info('Loading modules completed.');

// io.on('connection', function(client) {
//     console.log('a user connected');
//     client.on('disconnect', function() {
//         console.log('user disconnected');
//     });
// });
