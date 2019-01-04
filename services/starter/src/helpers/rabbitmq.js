const amqp = require('amqplib');

const amqpUri = process.env.AMQP_URI || 'amqp://localhost';

const init = async () => {
    const conn = await amqp.connect(amqpUri);
    const channel = await conn.createChannel();
    return await channel;
};

module.exports = init().catch((err) => {
    console.error(err.message);
    process.exit(2);
});