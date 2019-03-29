const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ authKey }, ch) =>
	new Promise((resolve) => {
		rpcSend({
			ch,
			queue: 'user_profile:main_orchestrator',
			data: { authKey },
		}).then((res) => {
			if ([200, 400, 401].includes(res.status)) resolve(res);
			else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:main_api', process });
};

module.exports = method;
