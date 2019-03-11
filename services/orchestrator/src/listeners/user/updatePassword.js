const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { rpcSend, rpcConsume, send } = require('../../helpers/amqp-wrapper');

const processData = ({ email, pToken, newPassword }, ch) =>
	new Promise((resolve) => {
		async.series(
			{
				updatePassword: (cb) => {
					rpcSend({
						ch,
						queue: 'user_profile:updatePassword_orchestrator',
						data: { email, pToken, newPassword },
					}).then((res) => {
						if (res.status === 200) cb();
						else if (![500].includes(res.status)) cb('updatePassword', res);
						else cb('updatePassword');
					});
				},
				mailer: (cb) => {
					if (Production)
						send({
							ch,
							queue: 'mailer_profile:updatePassword_orchestrator',
							data: { email },
						});
					cb();
				},
			},
			(err, result) => {
				if (err) {
					if (err === 'updatePassword' && !!result[err]) resolve(result[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else
					resolve({
						status: 200,
						data: { msg: 'The Password has been updated.' },
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:updatePassword_api', process: processData });
};

module.exports = method;
