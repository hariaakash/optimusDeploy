const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email, pToken, newPwd }, ch) =>
	new Promise((resolve) => {
		async.series(
			{
				updatePassword: (cb) => {
					rpcSend({
						ch,
						queue: 'user_profile:updatePassword_orchestrator',
						data: { email, pToken, newPwd },
					}).then((res) => {
						if (res.status === 200) {
							cb();
						} else if (res.status === 400) {
							cb('updatePassword', res.msg);
						} else {
							cb('updatePassword');
						}
					});
				},
			},
			(err, result) => {
				if (err) {
					if (err === 'updatePassword' && !!result[err])
						resolve({ status: 400, data: { msg: result[err] } });
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					resolve({
						status: 200,
						data: { msg: 'The Password has been updated.' },
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_user:updatePassword_api',
		process,
	});
};

module.exports = method;
