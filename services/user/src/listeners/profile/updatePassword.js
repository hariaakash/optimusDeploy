const bcrypt = require('bcryptjs');
const nanoid = require('nanoid');

const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const updatePassword = ({ user, pToken, newPwd }) =>
	new Promise((resolve) => {
		if (user) {
			if (user.conf.pToken === pToken) {
				bcrypt.hash(newPwd, 10).then((hash) => {
					user.conf.hashPassword = hash;
					user.conf.pToken = null;
					return user.save().then(() =>
						resolve({
							status: 200,
							data: { msg: 'Password Updated' },
						})
					);
				});
			} else {
				return resolve({
					status: 400,
					msg: 'Reset Token Did Not Match.',
				});
			}
		} else {
			return resolve({
				status: 400,
				msg: 'User Not Found. Please Try Again',
			});
		}
		return undefined;
	});

const process = (data) =>
	new Promise((resolve) => {
		console.log('Listner Invoked');
		const { email, pToken, newPwd } = data;
		User.findOne({
			email,
		})
			.select('conf.pToken conf.hashPassword')
			.then((user) => updatePassword({ user, pToken, newPwd }))
			.then((res) => resolve(res))
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
