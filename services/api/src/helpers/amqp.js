const amqp = require('amqplib');

const amqpUri = process.env.AMQP_URI || 'amqp://localhost';

const retry = (ms, cb) => setTimeout(() => init(cb), ms * 1000);

const init = async (cb) => {
	try {
		console.log('Trying to establish connection');
		const conn = await amqp.connect(amqpUri);
		const channel = await conn.createChannel();
		channel.connected = false;
		conn.on('error', (err) => {
			console.log(`Some error: ${err.message}`);
			console.log('Closing connection and retrying.');
			channel.connected = false;
			conn.close();
			retry(5, cb);
		});
		conn.on('close', (err) => {
			console.log('Disconnected, retrying.');
			channel.connected = false;
			retry(5, cb);
		});
		console.log('Connected');
		channel.connected = true;
		cb(channel);
	} catch (err) {
		console.log('Connection failed, retrying.');
		retry(5, cb);
	}
};

module.exports = init;
