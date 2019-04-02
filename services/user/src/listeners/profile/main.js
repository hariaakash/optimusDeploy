const apm = require('elastic-apm-node');

const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ authKey }) =>
	new Promise((resolve) => {
		const procTransaction = apm.startTransaction('User-Service: Main');
		User.findOne({ 'authKey.token': authKey })
			.populate('projects', 'easyId name')
			.select('email conf.eVerified conf.blocked conf.social projects')
			.then((user) => {
				if (user) resolve({ status: 200, data: user });
				else resolve({ status: 401, data: { msg: 'Invalid authentication key.' } });
			})
			.then(() => {
				if (procTransaction) procTransaction.end();
			})
			.catch((err) => {
				resolve({ status: 500 });
				if (procTransaction) procTransaction.end();
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:main_orchestrator', process });
};

module.exports = method;
