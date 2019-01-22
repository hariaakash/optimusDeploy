const nanoid = require('nanoid');

const User = require('../../schemas/user');
const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = (data) =>
	new Promise((resolve) => {
		const { email } = data;
		User.findOne({
			email,
		})
			.then((user) => {
				user.pToken = nanoid();
				return user.save().then(() => resolve({ status: 200 }));
			})
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'user_profile:forgotPassword_orchestrator',
		process,
	});
};

module.exports = method;
