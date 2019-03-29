const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ authKey }) =>
	new Promise((resolve) => {
		User.findOne({ 'authKey.token': authKey })
			.select('email conf.eVerified projects')
			.then((user) => {
				if (user) resolve({ status: 200, data: user });
				else resolve({ status: 401, data: { msg: 'Invalid authentication key.' } });
			})
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:main_orchestrator', process });
};

module.exports = method;
