const { send, consume } = require('../helpers/amqp-wrapper');

const task = (ch) => {
	const queue = 'user:create';

	send({
		ch,
		queue,
		data: { task: 1, msg: 'Ha' },
	});

	consume({
		ch,
		queue,
		process: (data) => {
			console.log(data.content);
			ch.ack(data);
		},
	});
};

module.exports = task;
