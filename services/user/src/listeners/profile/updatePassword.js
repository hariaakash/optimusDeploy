const bcrypt = require('bcryptjs');
const nanoid = require('nanoid');

const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const updatePassword = ({ user, pToken, newPassword }) =>
	new Promise((resolve) => {
		if (user) {
			if (user.conf.pToken === pToken) {
				bcrypt.hash(newPassword, 10).then((hash) => {
					user.conf.hashPassword = hash;
					user.conf.pToken = null;
					user.authKey.token = nanoid();
					user.save().then(() =>
						resolve({ status: 200, data: { msg: 'Password updated successfully.' } })
					);
				});
			} else resolve({ status: 400, data: { msg: 'Reset token did not match or expired.' } });
		} else resolve({ status: 400, data: { msg: 'User not found. Please Try Again' } });
	});

const process = ({ email, pToken, newPassword }) =>
	new Promise((resolve) => {
		User.findOne({
			email,
		})
			.select('conf.pToken conf.hashPassword')
			.then((user) => updatePassword({ user, pToken, newPassword }))
			.then(resolve)
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'user_profile:updatePassword_orchestrator',
		process,
	});
};

module.exports = method;
