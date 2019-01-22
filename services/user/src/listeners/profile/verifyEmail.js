const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const verifyEmail = (user) =>
	new Promise((resolve) => {
		if (user) {
			if (user.conf.eVerified)
				resolve({ status: 400, data: 'User email is already verified.' });
			else {
				user.conf.eVerified = true;
				user.save();
				resolve({ status: 200, data: 'User email verified successfully.' });
			}
		} else resolve({ status: 400, data: 'User not registered.' });
	});

const process = ({ email, token }) =>
	new Promise((resolve) => {
		User.findOne({
			email,
			'conf.eToken': token,
		})
			.select('conf')
			.then((user) => verifyEmail(user))
			.then((res) => resolve(res))
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
