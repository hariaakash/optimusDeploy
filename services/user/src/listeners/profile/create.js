const apm = require('elastic-apm-node');
const bcrypt = require('bcryptjs');
const nanoid = require('nanoid');

const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email, password }) =>
	new Promise((resolve) => {
		const createTransaction = apm.startTransaction('User-service: user-creation');
		bcrypt
			.hash(password, 10)
			.then((hash) => {
				const user = new User();
				user.email = email;
				user.authKey.token = nanoid();
				user.conf.hashPassword = hash;
				user.conf.eToken = nanoid();
				user.save().then(() =>
					resolve({ status: 200, data: { email, eToken: user.conf.eToken } })
				);
			})
			.then(() => {
				if (createTransaction) {
					createTransaction.end();
				}
			})
			.catch((err) => {
				if (createTransaction) {
					createTransaction.end();
				}
				resolve({ status: 500 });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:create_orchestrator', process });
};

module.exports = method;
