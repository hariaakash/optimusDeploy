const rfr = require('rfr');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);


const config = rfr('config');
const db = rfr('src/helpers/mongoose');


server.listen(config.web.port, config.web.ip);
console.log('Express running on ' + config.web.ip + ':' + config.web.port);
db();

// io.on('connection', function(client) {
//     console.log('a user connected');
//     client.on('disconnect', function() {
//         console.log('user disconnected');
//     });
// });
