// Make sure to require the Amqp Connection Class
const Amqp = require('./helpers/amqp');

// For each queue / channel create a new object of the Amqp Class
// Messages are durable by default, can be overridden by passing options
const helloQueue = new Amqp('helloqueue');

// For creation of listener.
helloQueue.addListener();

// Listener to watch for data
helloQueue.on('data', (data) => {
	console.log('Received');

	// Parse data : buffer -> string -> json
	console.log(JSON.parse(data.content.toString()));

	// Acknowledge if messages are durable
	helloQueue.ack(data);
});

// Send data to queue
helloQueue.send({
		msg: 'hello',
	})
	.then(console.log('Sent'))
	.catch(console.log);