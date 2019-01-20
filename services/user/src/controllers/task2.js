const rpcClient = require('../helpers/rpc').client;

const task = (ch) => {
	const queue = 'rpc_queue';
	rpcClient(ch, queue, 'Hello').then((data) =>
		console.log(data.content.toString())
	);
	rpcClient(ch, queue, 'Yaya').then((data) =>
		console.log(data.content.toString())
	);
	setTimeout(() => {
		console.log('After timeout');
		rpcClient(ch, queue, 'Nanana').then((data) =>
			console.log(data.content.toString())
		);
	}, 5000);
};

module.exports = task;
