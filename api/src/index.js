const conn = require('./helpers/rabbitmq');

const channel = 'tasks';

conn.then((ch) => {

    ch.assertQueue(channel, {
        durable: true
    });

    ch.sendToQueue(channel, Buffer.from('something to do'), {
        persistent: true
    });

});