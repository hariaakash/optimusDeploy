const apm = require('elastic-apm-node');
const bcrypt = require('bcryptjs');
const nanoid = require('nanoid');

const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const updatePassword = ({ user, token, newPassword }) =>
	new Promise((resolve) => {
		if (user) {
			if (user.conf.pToken === token) {
				bcrypt.hash(newPassword, 10).then((hash) => {
					if (!user.conf.setPassword) user.conf.setPassword = true;
					user.conf.hashPassword = hash;
					user.conf.pToken = null;
					user.authKey.token = nanoid();
					user.save().then(() =>
						resolve({ status: 200, data: { msg: 'Password updated successfully.' } })
					);
				});
			} else resolve({ status: 401, data: { msg: 'Reset token did not match or expired.' } });
		} else resolve({ status: 404, data: { msg: 'User not found. Please Try Again' } });
	});

const process = ({ email, token, newPassword }) =>
	new Promise((resolve) => {
		const updateTransaction = apm.startTransaction('User-Service: user-update-password');
		User.findOne({
			email,
		})
			.select('conf.pToken conf.hashPassword')
			.then((user) => updatePassword({ user, token, newPassword }))
			.then(resolve)
			.then(() => {
				if (updateTransaction) {
					updateTransaction.end();
				}
			})
			.catch((err) => {
				if (updateTransaction) {
					updateTransaction.end();
				}
				resolve({ status: 500 });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:updatePassword_orchestrator', process });
};

module.exports = method;
