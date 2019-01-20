const uuid = require('uuid');

const server = (ch, queue, process) => {
	ch.assertQueue(queue, {
			durable: false
		})
		.then(() => ch.consume(queue, (data) => {
			process(data)
				.then((result) => {
					ch.sendToQueue(data.properties.replyTo,
						Buffer.from(result), {
							correlationId: data.properties.correlationId
						});
					ch.ack(data);
				})
		}));

};

const client = (ch, queue, data) => {
	return new Promise((resolve, reject) => {
		const corrId = uuid.v4();
		ch.assertQueue('', {
				exclusive: true
			})
			.then((ok) => ok.queue)
			.then((ok) => {
				return ch.consume(ok, (data) => {
						if (data.properties.correlationId === corrId) {
							resolve(data);
						}
					})
					.then(() => ok);
			})
			.then((ok) => {
				ch.sendToQueue(queue, Buffer.from(data), {
					correlationId: corrId,
					replyTo: ok
				});
			});
	});
};

const rpc = {
	server,
	client,
};

module.exports = rpc;