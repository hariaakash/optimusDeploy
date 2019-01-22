const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = (data) =>
	new Promise((resolve) => {
		const { email } = data;
		User.findOne({
			email,
		})
			.select('email')
			.then((user) => resolve({ status: 200, data: !!user }))
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'user_profile:exists_orchestrator',
		process,
	});
};

module.exports = method;
