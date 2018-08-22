const rfr = require('rfr');
const bunyan = require('bunyan');
const path = require('path');

const config = rfr('core');

const log = bunyan.createLogger({
    name: 'god',
    src: config.logger.src,
    serializers: bunyan.stdSerializers,
    streams: [{
        level: config.logger.level,
        stream: process.stdout,
    }, {
        type: 'rotating-file',
        level: config.logger.level,
        path: path.join(config.logger.path, 'god.log'),
        period: config.logger.period,
        count: config.logger.count
    }]
});

module.exports = log;
