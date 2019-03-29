const apm = require('elastic-apm-node');

const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { rpcSend, rpcConsume, send } = require('../../helpers/amqp-wrapper');

const processData = ({ email, pToken, newPassword }, ch) =>
	new Promise((resolve) => {
		const updateTransaction = apm.startTransaction('Orchestration: User: UpdatePassword');
		async.series(
			{
				updatePassword: (cb) => {
					const updateSpan = updateTransaction.startSpan(
						'AMQP Call: user_profile:updatePassword_orchestrator'
					);
					rpcSend({
						ch,
						queue: 'user_profile:updatePassword_orchestrator',
						data: { email, pToken, newPassword },
					})
						.then((res) => {
							if (res.status === 200) cb();
							else if (![500].includes(res.status)) cb('updatePassword', res);
							else cb('updatePassword');
						})
						.then(() => {
							if (updateSpan) {
								updateSpan.end();
							}
						});
				},
				mailer: (cb) => {
					const mailerSpan = updateTransaction.startSpan(
						'AMQP Call: mailer_profile:updatePassword_orchestrator'
					);
					if (Production)
						send({
							ch,
							queue: 'mailer_profile:updatePassword_orchestrator',
							data: { email },
						}).then(() => {
							if (mailerSpan) {
								mailerSpan.end();
							}
						});
					cb();
				},
			},
			(err, result) => {
				if (err) {
					if (err === 'updatePassword' && !!result[err]) resolve(result[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
					if (updateTransaction) {
						updateTransaction.end();
					}
				} else {
					resolve({
						status: 200,
						data: { msg: 'The Password has been updated.' },
					});
					if (updateTransaction) {
						updateTransaction.end();
					}
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:updatePassword_api', process: processData });
};

module.exports = method;
