const { rpcSend } = require('../helpers/amqp-wrapper');

const task = (ch) => {
	const queue = 'rpc_queue';
	rpcSend({ ch, queue, data: { task: 2, msg: 'Yaya' } }).then((data) => console.log(data));
	setTimeout(() => {
		console.log('After timeout');
		rpcSend({ ch, queue, data: { task: 2, msg: 'Nanana' } }).then((data) => console.log(data));
	}, 5000);
};

module.exports = task;
