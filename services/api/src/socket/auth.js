const { rpcSend } = require('../helpers/amqp-wrapper');

const Auth = (socket, next, ch) => {
	if (socket.handshake.query.authKey) {
		rpcSend({
			ch,
			queue: 'orchestrator_user:main_api',
			data: { authKey: socket.handshake.query.authKey },
		})
			.then(({ status, data }) => {
				if (status === 200) {
					socket.data = { user: data };
					next();
				} else next(new Error('Forbidden'));
			})
			.catch((err) => console.log(err));
	} else {
		next(new Error('Forbidden'));
	}
};

module.exports = Auth;
