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
const io = require('socket.io').listen(server);

const config = rfr('config');
const Log = rfr('src/helpers/logger');
const DBConnection = rfr('src/helpers/dbconnection');
const Sftp = rfr('src/helpers/sftp');
const EnsureDir = rfr('src/helpers/ensureDir');
const Init = rfr('src/helpers/init');
const Routes = rfr('src/routes');
const Socket = rfr('src/socket');

async.auto({
	middleware: [(callback) => {
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
		app.use(cors({
			origin: (origin, callback) => {
				if (config.morgan.whitelist.indexOf(origin) !== -1) {
					callback(null, true);
				} else {
					callback(`Origin ${origin} not allowed by CORS`);
				}
			}
		}));
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
	dbconnection: [(callback) => {
		DBConnection(callback);
	}],
	ensureSftp: [(callback) => {
		Sftp.ensureGroup(callback);
	}],
	init: [(callback) => {
		Init(callback);
	}],
	start_express: ['middleware', 'ensure_directories', 'dbconnection', 'ensureSftp', 'init', (result, callback) => {
		Log.info(result.middleware);
		Log.info(result.ensure_directories);
		Log.info(result.dbconnection);
		Log.info(result.ensureSftp);
		Log.info(result.init);
		Socket(io);
		server.listen(config.web.port, config.web.host);
		callback(null, `Express & Socket running on ${config.web.host}:${config.web.port}`);
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