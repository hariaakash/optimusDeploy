const conn = require('./helpers/amqp');

const controllers = require('./controllers');

Promise.resolve(conn)
	.then(controllers)
	.catch((err) => {
		console.log('Error from index');
		console.log(err);
	});
