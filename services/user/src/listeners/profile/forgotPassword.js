const nanoid = require('nanoid');

const User = require('../../schemas/user');
const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = (data) =>
	new Promise((resolve) => {
		console.log('Queue Reached');
		const { email } = data;
		User.findOne({
			email,
		})
			.then((user) => {
				console.log('User Searched');
				if (user) {
					console.log(`User Found ${user}`);
					user.conf.pToken = nanoid();
					user.save().then(() => resolve({ status: 200 }));
				} else {
					console.log('User Not Found');
					resolve({ status: 400 });
				}
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
