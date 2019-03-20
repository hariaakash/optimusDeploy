const bcrypt = require('bcryptjs');
const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const checkPassword = ({ user, password }) =>
	new Promise((resolve) => {
		if (user) {
			if (user.conf.setPassword) {
				bcrypt.compare(password, user.conf.hashPassword).then((status) => {
					if (status) {
						if (!user.conf.eVerified) {
							resolve({ status: 403, data: { msg: 'Email not verified.' } });
						} else {
							resolve({
								status: 200,
								data: {
									authKey: user.authKey.token,
									msg: 'Successfully authenticated using email.',
								},
							});
						}
					} else resolve({ status: 401, data: { msg: 'Password is incorrect.' } });
				});
			} else resolve({ status: 403, data: { msg: 'Password is not set.' } });
		} else resolve({ status: 404, data: { msg: 'User not registered.' } });
	});

const process = ({ email, password }) =>
	new Promise((resolve) => {
		User.findOne({
			email,
		})
			.select('email authKey.token conf.hashPassword conf.eVerified conf.setPassword')
			.then((user) => checkPassword({ user, password }))
			.then(resolve)
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:authEmail_orchestrator', process });
};

module.exports = method;
