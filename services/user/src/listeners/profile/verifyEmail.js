const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const verifyEmail = ({ user, token }) =>
	new Promise((resolve) => {
		if (user) {
			if (user.conf.eVerified)
				resolve({ status: 400, data: { msg: 'User email is already verified.' } });
			else if (user.conf.eToken === token) {
				user.conf.eVerified = true;
				user.save().then(() =>
					resolve({ status: 200, data: { msg: 'User email verified successfully.' } })
				);
			} else resolve({ status: 401, data: { msg: 'Token is invalid or got expired.' } });
		} else resolve({ status: 404, data: { msg: 'User not registered.' } });
	});

const process = ({ email, token }) =>
	new Promise((resolve) => {
		User.findOne({
			email,
		})
			.select('conf.eToken conf.eVerified')
			.then((user) => verifyEmail({ user, token }))
			.then(resolve)
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'user_profile:verifyEmail_orchestrator',
		process,
	});
};

module.exports = method;
