const apm = require('elastic-apm-node');
const nanoid = require('nanoid');

const User = require('../../schemas/user');
const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email }) =>
	new Promise((resolve) => {
		const forgotTransaction = apm.startTransaction('User-service: user-forgot-password');
		User.findOne({
			email,
		})
			.then((user) => {
				if (user) {
					user.conf.pToken = nanoid();
					user.save().then(() =>
						resolve({ status: 200, data: { email, pToken: user.conf.pToken } })
					);
				} else resolve({ status: 404, data: { msg: 'User Not Found' } });
			})
			.then(() => {
				if (forgotTransaction) {
					forgotTransaction.end();
				}
			})
			.catch((err) => {
				if (forgotTransaction) {
					forgotTransaction.end();
				}
				resolve({ status: 500 });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:forgotPassword_orchestrator', process });
};

module.exports = method;
