const {
	EventEmitter
} = require('events');
const amqp = require('amqp-connection-manager');

const amqpUri = process.env.AMQP_URI || 'amqp://localhost';

const conn = amqp.connect(amqpUri);

conn.on('connect', function () {
	console.log('Connected to RabbitMQ');
});
conn.on('disconnect', function (params) {
	console.log('Disconnected from RabbitMQ.', params.err.stack);
});

/**
 * AmqpClass
 */
class Amqp extends EventEmitter {

	/**
	 * @constructor Creates channel wrapper
	 * @param {string} queue - Queue name
	 * @param {Object} options - assertQueue options
	 */
	constructor(queue, options = {
		durable: true,
	}) {
		super();
		this.queue = queue;
		this.channelWrapper = conn.createChannel({
			setup: (channel) => {
				channel.assertQueue(queue, options);
			}
		});
	}

	/**
	 * @addSetup Creates listen on the queue
	 * @param {Object} options - assertQueue options
	 * @returns {Promise} - Promise
	 */
	addSetup(options = {}) {
		return new Promise((resolve, reject) => {
			try {
				this.channelWrapper.addSetup((channel) => {
					return Promise.all([
						channel.assertQueue(this.queue, options),
						channel.consume(this.queue, data => this.onMessage(data))
					]);
				});
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * @send Send messages to the queue
	 * @param {Object} data - Refer to amqplib API
	 * @returns {Promise} Promise refer to amqplib API
	 */
	send(data = {}) {
		return this.channelWrapper.sendToQueue(this.queue, Buffer.from(JSON.stringify(data)));
	}

	/**
	 * @onMessage Event emitter whenever a message is received
	 * @param {Object} data
	 */
	onMessage(data) {
		this.emit('data', data);
	}

	/**
	 * @ack Acknowledge message
	 * @param {Object} - data 
	 */
	ack(data) {
		this.channelWrapper.ack(data);
	}

	/**
	 * @disconnect Close the queue wrapper
	 * @returns {Promise} Promise
	 */
	disconnect() {
		return new Promise((resolve, reject) => {
			try {
				this.channelWrapper.close();
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}
}

module.exports = Amqp;