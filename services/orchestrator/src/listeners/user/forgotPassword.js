const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email }, ch) =>
	new Promise((resolve) => {
		async.series(
			{
				forgotPassword: (cb) => {
					rpcSend({
						ch,
						queue: 'user_profile:forgotPassword_orchestrator',
						data: { email },
					}).then((res) => {
						if (res.status === 200) cb();
						else if (res.status === 400) cb('forgotPassword', res);
						else cb('forgotPassword');
					});
				},
			},
			(err, result) => {
				if (err) {
					if (err === 'forgotPassword' && !!result[err]) resolve(result[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else
					resolve({
						status: 200,
						data: { msg: 'Instructions to reset password has been sent to email.' },
					});
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