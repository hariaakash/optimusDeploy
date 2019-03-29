const apm = require('elastic-apm-node');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email, token }, ch) =>
	new Promise((resolve) => {
		const verifyTransaction = apm.startTransaction('Orchestration: User: VerifyEmail');
		rpcSend({
			ch,
			queue: 'user_profile:verifyEmail_orchestrator',
			data: { email, token },
		})
			.then((res) => {
				if (![500].includes(res.status)) resolve(res);
				else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
			})
			.then(() => {
				if (verifyTransaction) {
					verifyTransaction.end();
				}
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:verifyEmail_api', process });
};

module.exports = method;
