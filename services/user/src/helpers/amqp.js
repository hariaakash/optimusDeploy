const amqp = require('amqplib');

const amqpUri = process.env.AMQP_URI || 'amqp://localhost';

const retry = (ms) => setTimeout(init, ms * 1000);

const init = async () => {
	try {
		console.log('Trying to establish connection');
		const conn = await amqp.connect(amqpUri);
		const channel = await conn.createChannel();
		conn.on('error', (err) => {
			console.log(`Some error: ${err.message}`);
			console.log('Closing connection and retrying.');
			conn.close();
			retry(5);
		});
		conn.on('close', (err) => {
			console.log('Disconnected, retrying.');
			retry(5);
		});
		console.log('Connected');
		return channel;
	} catch (err) {
		console.log('Connection failed, retrying.');
		retry(5);
		return undefined;
	}
};

module.exports = init();
