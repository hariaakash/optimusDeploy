const conn = require('./helpers/amqp');

const listeners = require('./listeners');

conn(listeners);
