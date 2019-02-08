const conn = require('./helpers/amqp');
const mongodbConnection = require('./helpers/mongodbConnection');

const listeners = require('./listeners');

mongodbConnection();
conn(listeners);
