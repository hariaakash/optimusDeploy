const nanoid = require('nanoid');

/**
 * RPC Consume Wrapper for amqplib
 * @function rpcConsume
 * @param {Object} obj- Information required for handling rpc server side.
 * @param {Object} obj.ch - AMQP channel connection
 * @param {String} obj.queue - Queue to listen for consumption.
 * @param {function} obj.process - Callback to process received data.
 */
const rpcConsume = ({ ch, queue, process }) => {
	ch.assertQueue(queue, {
		durable: false,
	}).then(() =>
		ch.consume(queue, (data) => {
			process(JSON.parse(data.content.toString()), ch).then((result) => {
				ch.sendToQueue(data.properties.replyTo, Buffer.from(JSON.stringify(result)), {
					correlationId: data.properties.correlationId,
				});
				ch.ack(data);
			});
		})
	);
};

/**
 * RPC Send Wrapper for amqplib
 * @function rpcSend
 * @param {Object} obj- Information required for handling rpc client side.
 * @param {Object} obj.ch - AMQP channel connection
 * @param {String} obj.queue - Queue to which the data has to be sent for consumption.
 * @param {Object} obj.data - The data to be sent.
 */
const rpcSend = ({ ch, queue, data }) =>
	new Promise((resolve, reject) => {
		const corrId = nanoid();
		ch.assertQueue('', {
			exclusive: true,
		})
			.then((ok) => ok.queue)
			.then((ok) =>
				ch
					.consume(ok, (msg) => {
						if (msg.properties.correlationId === corrId) {
							resolve(JSON.parse(msg.content.toString()));
						}
					})
					.then(() => ok)
			)
			.then((ok) => {
				ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
					correlationId: corrId,
					replyTo: ok,
				});
			});
	});

/**
 * Send Wrapper (sendToQueue) for amqplib
 * @function send
 * @param {Object} obj- Information required for sending.
 * @param {Object} obj.ch - AMQP channel connection
 * @param {String} obj.queue - Queue to which the data has to be sent for consumption.
 * @param {Object} obj.data - The data to be sent.
 * @param {Object} [obj.options={ persistent: true }] - The options to be used for sending.
 * @returns {Promise} - Not necessary to handle this.
 */
const send = ({ ch, queue, data, options = { persistent: true } }) =>
	ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)), options);

/**
 * Consume Wrapper (consume) for amqplib
 * @function consume
 * @param {Object} obj- Information required for consumption.
 * @param {Object} obj.ch - AMQP channel connection
 * @param {String} obj.queue - Queue to which the data has to be sent for consumption.
 * @param {function} obj.process - Callback to process received data.
 * @returns {Promise} - Not necessary to handle this.
 */
const consume = ({ ch, queue, process }) =>
	ch.consume(queue, (data) => {
		const result = data;
		result.content = JSON.parse(result.content.toString());
		process(result);
	});

/**
 * Assert Wrapper (assertQueue) for amqplib
 * @function consume
 * @param {Object} obj- Information required for assert.
 * @param {Object} obj.ch - AMQP channel connection
 * @param {String} obj.queue - Queue to which the data has to be sent for consumption.
 * @param {Object} [obj.options={ durable: true }] - Options to be used for assert.
 * @returns {Promise} - Not necessary to handle this.
 */
const assert = ({ ch, queue, options = { durable: true } }) => ch.assertQueue(queue, options);

const rpc = {
	rpcSend,
	rpcConsume,
	send,
	consume,
	assert,
};

module.exports = rpc;
