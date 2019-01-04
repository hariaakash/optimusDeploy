const conn = require('./helpers/rabbitmq');

const channel = 'tasks';

conn.then((ch) => {

    ch.assertQueue(channel, {
        durable: true
    });

    ch.consume(channel, (msg) => {
        if (msg !== null) {
            console.log(msg.content.toString());
            ch.ack(msg);
        }
    });

});