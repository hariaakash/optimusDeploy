const apm = require('elastic-apm-node');
const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ email, password }, ch) =>
	new Promise((resolve) => {
		const createTransaction = apm.startTransaction('Orchestration: User: Creation');
		async.auto(
			{
				check: (cb) => {
					const checkSpan = createTransaction.startSpan(
						'AMQP Call: user_profile:exists_orchestrator'
					);
					rpcSend({
						ch,
						queue: 'user_profile:exists_orchestrator',
						data: { email },
					})
						.then((res) => {
							if (res.status === 200) {
								if (res.data.status)
									cb('check', { status: 400, data: { msg: res.data.msg } });
								else cb();
							} else cb('check');
						})
						.then(() => {
							if (checkSpan) {
								checkSpan.end();
							}
						});
				},
				create: [
					'check',
					(results, cb) => {
						const createSpan = createTransaction.startSpan(
							'AMQP Call: user_profile:create_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_profile:create_orchestrator',
							data: { email, password },
						})
							.then((res) => {
								if (res.status === 200) cb(null, res.data);
								else cb('create');
							})
							.then(() => {
								if (createSpan) {
									createSpan.end();
								}
							});
					},
				],
				mailer: [
					'create',
					(results, cb) => {
						const mailSpan = createTransaction.startSpan(
							'AMQP Call: mailer_profile:create_orchestrator'
						);
						if (Production)
							send({
								ch,
								queue: 'mailer_profile:create_orchestrator',
								data: results.create,
							}).then(() => {
								if (mailSpan) {
									mailSpan.end();
								}
							});
						cb();
					},
				],
			},
			(err, results) => {
				if (err) {
					if (err === 'check' && !!results[err]) resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
					if (createTransaction) {
						createTransaction.end();
					}
				} else {
					if (createTransaction) {
						createTransaction.end();
					}
					resolve({
						status: 200,
						data: {
							msg: 'User created successfully, check mail for verification',
							eToken: Production ? undefined : results.create.eToken,
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_user:create_api',
		process: processData,
	});
};

module.exports = method;
