const nanoid = require('nanoid');

const User = require('../../schemas/user');
const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email }) =>
	new Promise((resolve) => {
		User.findOne({
			email,
		})
			.then((user) => {
				if (user) {
					user.conf.pToken = nanoid();
					user.save().then(() =>
						resolve({ status: 200, data: { pToken: user.conf.pToken } })
					);
				} else resolve({ status: 400, data: { msg: 'User Not Found' } });
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
