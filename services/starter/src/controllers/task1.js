const task = (ch) => {

	const channel = 'tasks';

	ch.assertQueue(channel, {
		durable: true
	});
	
	ch.sendToQueue(channel, Buffer.from('something to do'), {
		persistent: true
	});

	ch.consume(channel, (data) => {
		console.log(data.content.toString());
		ch.ack(data);
	});
};

module.exports = task;