const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email }, ch) =>
	new Promise((resolve) => {
		rpcSend({
			ch,
			queue: 'user_profile:forgotPassword_orchestrator',
			data: { email },
		}).then((res) => {
			if (res.status === 200)
				resolve({
					status: 200,
					data: {
						msg:
							'The Link to update your password has been sent to the registered E-mail.',
					},
				});
			else if (res.status === 400) resolve({ status: 400, data: { msg: res.data } });
			else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
		});
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_user:forgotPassword_api',
		process,
	});
};

module.exports = method;
