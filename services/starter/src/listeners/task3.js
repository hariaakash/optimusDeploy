const { rpcConsume } = require('../helpers/amqp-wrapper');

const task = (ch) => {
	const queue = 'rpc_queue';
	rpcConsume({
		ch,
		queue,
		process: (data) =>
			new Promise((resolve) => {
				// console.log(data);
				resolve(data);
			}),
	});
};

module.exports = task;
