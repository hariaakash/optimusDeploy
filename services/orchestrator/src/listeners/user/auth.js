const apm = require('elastic-apm-node');
const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const authEmail = ({ email, password }, ch, trans) =>
	new Promise((resolve) => {
		const authSpan = trans.startSpan('AMQP Call: user_profile:authEmail_orchestrator');
		rpcSend({
			ch,
			queue: 'user_profile:authEmail_orchestrator',
			data: { email, password },
		}).then((res) => {
			if (![500].includes(res.status)) resolve(res);
			else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
			if (authSpan) {
				authSpan.end();
			}
		});
	});

const authGithub = ({ code }, ch, trans) =>
	new Promise((resolve) => {
		const authSpan = trans.startSpan('AMQP Call: user_profile:authGithub_orchestrator');
		rpcSend({
			ch,
			queue: 'user_profile:authGithub_orchestrator',
			data: { code },
		}).then((res) => {
			if (![500].includes(res.status)) resolve(res);
			else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
			if (authSpan) {
				authSpan.end();
			}
		});
	});

const process = ({ email, password, code, authType }, ch) =>
	new Promise((resolve) => {
		const authTransaction = apm.startTransaction('Orchestration: User: Authenticaiton');
		if (authType === 'email') {
			authEmail({ email, password }, ch, authTransaction)
				.then(resolve)
				.then(() => {
					if (authTransaction) {
						authTransaction.end();
					}
				});
		} else if (authType === 'github') {
			authGithub({ code }, ch, authTransaction)
				.then(resolve)
				.then(() => {
					if (authTransaction) {
						authTransaction.end();
					}
				});
		} else {
			if (authTransaction) {
				authTransaction.end();
			}
			resolve({
				status: 500,
				data: { msg: `Authentication type:${authType} not available` },
			});
		}
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:auth_api', process });
};

module.exports = method;
