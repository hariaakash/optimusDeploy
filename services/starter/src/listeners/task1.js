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
		process: (data) =>
			new Promise((resolve, reject) => {
				try {
					console.log(data);
					resolve(true); // resolve(true) to ack, resolve() to do nothing.
				} catch (err) {
					reject(); // reject() to nack
				}
			}),
	});
};

module.exports = task;
