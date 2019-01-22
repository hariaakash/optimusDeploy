const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email }, ch) =>
	new Promise((resolve) => {
		async.series(
			{
				generateToken: (cb) => {
					rpcSend({
						ch,
						queue: 'user_profile:generatePToken_orchestrator',
						data: { email },
					}).then((res) => {
						if (res.status === 200) {
							cb();
						} else cb('generateToken');
					});
				},
			},
			(err, result) => {
				if (err) {
					if (err) resolve(result[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					resolve({
						status: 200,
						data: { msg: 'The Password reset mail has been Sent.' },
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_user:forgotPassword_api',
		process,
	});
};

module.exports = method;
