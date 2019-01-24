const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email, password }, ch) =>
	new Promise((resolve) => {
		async.series(
			{
				check: (cb) => {
					rpcSend({
						ch,
						queue: 'user_profile:exists_orchestrator',
						data: { email },
					}).then((res) => {
						if (res.status === 200) {
							if (res.data.status)
								cb('check', { status: 400, data: { msg: res.data.msg } });
							else cb();
						} else cb('check');
					});
				},
				create: (cb) => {
					rpcSend({
						ch,
						queue: 'user_profile:create_orchestrator',
						data: { email, password },
					}).then((res) => {
						if (res.status === 200) cb(null, res.data);
						else cb('create');
					});
				},
			},
			(err, results) => {
				if (err) {
					if (err === 'check' && !!results[err]) resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else
					resolve({
						status: 200,
						data: { msg: 'User created successfully, check mail for verification' },
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_user:create_api',
		process,
	});
};

module.exports = method;
