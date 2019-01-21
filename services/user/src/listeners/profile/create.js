const bcrypt = require('bcryptjs');
const hat = require('hat');

const rack = hat.rack();

const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = (data) =>
	new Promise((resolve) => {
		const { email, password } = data;
		bcrypt
			.hash(password, 10)
			.then((hash) => {
				const user = new User();
				user.email = email;
				user.authKey.token = rack();
				user.conf.hashPassword = hash;
				user.conf.eToken = rack();
				return user.save().then(() => resolve({ status: 200 }));
			})
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'user_profile:create_orchestrator',
		process,
	});
};

module.exports = method;
