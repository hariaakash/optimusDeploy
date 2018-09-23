const rfr = require('rfr');
const bunyan = require('bunyan');
const path = require('path');

const config = rfr('config');

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