const apm = require('elastic-apm-node');

const User = require('../../schemas/user');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ projectId }) =>
	new Promise((resolve) => {
		const procTransaction = apm.startTransaction('User-Service: existsProject');
		User.findOne({ projects: projectId })
			.populate('projects', 'easyId')
			.select('conf.social projects')
			.then((user) =>
				user
					? resolve({ status: 200, data: user })
					: resolve({ status: 404, data: { msg: 'User not exist.' } })
			)
			.then(() => {
				if (procTransaction) procTransaction.end();
			})
			.catch((err) => {
				resolve({ status: 500 });
				if (procTransaction) procTransaction.end();
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:existsProject_orchestrator', process });
};

module.exports = method;
