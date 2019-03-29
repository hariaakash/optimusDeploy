const apm = require('elastic-apm-node');
const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email }) =>
	new Promise((resolve) => {
		const existsTransaction = apm.startTransaction('User-service: user-exists');
		User.findOne({
			email,
		})
			.select('email')
			.then((user) =>
				resolve({
					status: 200,
					data: {
						status: !!user,
						msg: user ? 'User already registered.' : 'User not found.',
					},
				})
			)
			.then(() => {
				if (existsTransaction) {
					existsTransaction.end();
				}
			})
			.catch((err) => {
				if (existsTransaction) {
					existsTransaction.end();
				}
				resolve({ status: 500 });
			});
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'user_profile:exists_orchestrator',
		process,
	});
};

module.exports = method;
