const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { rpcSend, rpcConsume, send } = require('../../helpers/amqp-wrapper');

const processData = ({ email }, ch) =>
	new Promise((resolve) => {
		async.auto(
			{
				forgotPassword: (cb) => {
					rpcSend({
						ch,
						queue: 'user_profile:forgotPassword_orchestrator',
						data: { email },
					}).then((res) => {
						if (res.status === 200) cb(null, res.data);
						else if (res.status === 404) cb('forgotPassword', res);
						else cb('forgotPassword');
					});
				},
				mailer: [
					'forgotPassword',
					(results, cb) => {
						if (Production)
							send({
								ch,
								queue: 'mailer_profile:forgotPassword_orchestrator',
								data: results.forgotPassword,
							});
						cb();
					},
				],
			},
			(err, results) => {
				if (err) {
					if (err === 'forgotPassword' && !!results[err]) resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else
					resolve({
						status: 200,
						data: {
							msg: 'Instructions to reset password has been sent to email.',
							pToken: Production ? undefined : results.forgotPassword.pToken,
						},
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_user:forgotPassword_api',
		process: processData,
	});
};

module.exports = method;
