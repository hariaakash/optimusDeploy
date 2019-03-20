const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const authEmail = ({ email, password }, ch) =>
	new Promise((resolve) => {
		rpcSend({
			ch,
			queue: 'user_profile:authEmail_orchestrator',
			data: { email, password },
		}).then((res) => {
			if (![500].includes(res.status)) resolve(res);
			else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
		});
	});

const authGithub = ({ code }, ch) =>
	new Promise((resolve) => {
		rpcSend({
			ch,
			queue: 'user_profile:authGithub_orchestrator',
			data: { code },
		}).then((res) => {
			if (![500].includes(res.status)) resolve(res);
			else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
		});
	});

const process = ({ email, password, code, authType }, ch) =>
	new Promise((resolve) => {
		if (authType === 'email') authEmail({ email, password }, ch).then(resolve);
		else if (authType === 'github') authGithub({ code }, ch).then(resolve);
		else
			resolve({
				status: 500,
				data: { msg: `Authentication type:${authType} not available` },
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:auth_api', process });
};

module.exports = method;
