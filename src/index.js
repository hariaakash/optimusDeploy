const rfr = require('rfr');
const fs = require('fs');
const path = require('path');
const async = require('async');
const app = require('express')();
const server = require('http').createServer(app);
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
// const io = require('socket.io').listen(server);

const config = rfr('config');
const Log = rfr('src/helpers/logger');
const DBConnection = rfr('src/helpers/mongoose');
const Routes = rfr('src/routes');

async.auto({
	pretty_init: (callback) => {
		Log.info('+ ------------------------------------ +');
		Log.info('|          Optimus Deploy              |');
		Log.info('+ ------------------------------------ +');
		callback(null, 'Starting modules, this could take a few seconds.');
		app.use(morgan('common', {
			stream: fs.createWriteStream(path.join(config.logger.path, 'access.log'), {
				flags: 'a'
			})
		}));
		app.use(morgan('dev'));
		app.use(cors());
		app.use(bodyParser.urlencoded({
			extended: false
		}));
		app.use(bodyParser.json());
		app.use(Routes);
	},
	connect_mongodb: ['pretty_init', (result, callback) => {
		Log.info(result.pretty_init);
		DBConnection(callback);
	}],
	start_express: ['connect_mongodb', (result, callback) => {
		Log.info(result.connect_mongodb);
		server.listen(config.web.port, config.web.ip);
		callback(null, `Express running on ${config.web.ip}:${config.web.port}`);
	}],
}, (err, result) => {
	if (err) {
		Log.error(err);
		Log.error('A fatal error caused the daemon to abort the startup.');
	} else {
		Log.info(result.start_express);
		Log.info('Daemon started successfully.');
	}
});

// io.on('connection', function(client) {
//     console.log('a user connected');
//     client.on('disconnect', function() {
//         console.log('user disconnected');
//     });
// });