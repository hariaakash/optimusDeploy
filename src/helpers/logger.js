const rfr = require('rfr');
const fs = require('fs');
const bunyan = require('bunyan');
const path = require('path');

const config = rfr('config');

// Check if Directory exists else create the logs dir
const dir = './logs';
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

const Log = bunyan.createLogger({
	name: 'master',
	src: config.logger.src,
	serializers: bunyan.stdSerializers,
	streams: [{
		stream: process.stdout,
	}, {
		type: 'rotating-file',
		level: 'info',
		path: path.join(config.logger.path, 'info.log'),
		period: config.logger.period,
		count: config.logger.count,
	}, {
		type: 'rotating-file',
		level: 'error',
		path: path.join(config.logger.path, 'error.log'),
		period: config.logger.period,
		count: config.logger.count,
	}],
});

module.exports = Log;