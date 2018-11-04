const rfr = require('rfr');
const fs = require('fs');
const path = require('path');
const async = require('async');
const app = require('express')();
const server = require('http').createServer(app);
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const requestIp = require('request-ip');
// const io = require('socket.io').listen(server);

const config = rfr('config');
const Log = rfr('src/helpers/logger');
const DBConnection = rfr('src/helpers/mongoose');
const EnsureDir = rfr('src/helpers/ensureDir');
const Routes = rfr('src/routes');

async.auto({
	pretty_init: [(callback) => {
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
		app.use(cookieParser());
		app.use(requestIp.mw());
		app.use(Routes);
	}],
	ensure_directories: [(callback) => {
		EnsureDir(callback);
	}],
	connect_mongodb: [(callback) => {
		DBConnection(callback);
	}],
	start_express: ['pretty_init', 'ensure_directories', 'connect_mongodb', (result, callback) => {
		Log.info(result.pretty_init);
		Log.info(result.ensure_directories);
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