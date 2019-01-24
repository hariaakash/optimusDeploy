const bcrypt = require('bcryptjs');
const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const checkPassword = ({ user, password }) =>
	new Promise((resolve) => {
		if (user)
			bcrypt.compare(password, user.conf.hashPassword).then((status) => {
				if (status)
					resolve({
						status: 200,
						data: {
							authKey: user.authKey.token,
							msg: 'Successfully authenticated using email.',
						},
					});
				resolve({ status: 400, data: { msg: 'Password is incorrect.' } });
			});
		else resolve({ status: 400, data: { msg: 'User not registered.' } });
	});

const process = ({ email, password }) =>
	new Promise((resolve) => {
		User.findOne({
			email,
		})
			.select('email authKey.token conf.hashPassword')
			.then((user) => checkPassword({ user, password }))
			.then(resolve)
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'user_profile:authEmail_orchestrator',
		process,
	});
};

module.exports = method;
