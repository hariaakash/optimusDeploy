const conn = require('./helpers/amqp');

const controllers = require('./controllers');

conn(controllers);
