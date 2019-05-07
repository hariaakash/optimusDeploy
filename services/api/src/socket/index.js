const auth = require('./auth');

const Socket = (io, ch) => {
	io.use((socket, next) => auth(socket, next, ch));

	io.on('connection', (client) => {
		console.log(`User connected with authKey: ${client.data.user.email}`);

		client.on('message', (data) => {
			console.log(data);
			client.emit('message', 'received');
		});

		client.on('disconnect', () => {
			console.log(`User disconnected with authKey: ${client.data.user.email}`);
		});
	});
};

module.exports = Socket;
