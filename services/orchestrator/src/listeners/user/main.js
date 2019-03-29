const apm = require('elastic-apm-node');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ authKey }, ch) =>
	new Promise((resolve) => {
		const procTransaction = apm.startTransaction('Orchestration: User: Main');
		rpcSend({
			ch,
			queue: 'user_profile:main_orchestrator',
			data: { authKey },
		})
			.then((res) => {
				if ([200, 400, 401].includes(res.status)) resolve(res);
				else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
			})
			.then(() => {
				if (procTransaction) {
					procTransaction.end();
				}
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:main_api', process });
};

module.exports = method;
