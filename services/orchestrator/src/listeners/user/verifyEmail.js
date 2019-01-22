const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email, token }, ch) =>
	new Promise((resolve) => {
		rpcSend({
			ch,
			queue: 'user_profile:verifyEmail_orchestrator',
			data: { email, token },
		}).then((res) => {
			if (res.status === 200) resolve({ status: 200, data: { msg: res.data } });
			else if (res.status === 400) resolve({ status: 400, data: { msg: res.data } });
			else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
		});
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_user:verifyEmail_api',
		process,
	});
};

module.exports = method;
