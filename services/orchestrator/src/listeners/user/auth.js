const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const authEmail = ({ email, password }, ch) =>
	new Promise((resolve) => {
		rpcSend({
			ch,
			queue: 'user_profile:authEmail_orchestrator',
			data: { email, password },
		}).then((res) => {
			if (res.status === 200)
				resolve({
					status: 200,
					data: { authKey: res.data, msg: 'User authenticated using email.' },
				});
			else if (res.status === 400) resolve({ status: 400, data: { msg: res.data } });
			else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
		});
	});

const process = ({ email, password, authType }, ch) =>
	new Promise((resolve) => {
		if (authType === 'email') authEmail({ email, password }, ch).then((res) => resolve(res));
		else
			resolve({
				status: 500,
				data: { msg: `Authentication type:${authType} not available` },
			});
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_user:auth_api',
		process,
	});
};

module.exports = method;
