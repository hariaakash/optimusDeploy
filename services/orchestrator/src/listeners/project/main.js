const apm = require('elastic-apm-node');
const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId }, ch) =>
	new Promise((resolve) => {
		const removeProTrans = apm.startTransaction('Orchestration: User: Create-Project');
		async.auto(
			{
				checkAuth: [
					(cb) => {
						const checkAuthSpan = removeProTrans.startSpan(
							'AMQP Call: user_profile:main_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_profile:main_orchestrator',
							data: { authKey },
						})
							.then((res) => {
								if (res.status === 200) cb(null, res.data);
								else if ([401, 404].includes(res.status)) cb('checkAuth', res);
								else cb('checkAuth');
							})
							.then(() => {
								if (checkAuthSpan) {
									checkAuthSpan.end();
								}
							});
					},
				],
				getProject: [
					'checkAuth',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_project:main_orchestrator',
							data: { userId: results.checkAuth._id, easyId: projectEasyId },
						}).then((res) => cb(null, res));
					},
				],
			},
			(err, results) => {
				if (err) {
					if (['checkAuth', 'getProject'].includes(err) && !!results[err])
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
					if (removeProTrans) {
						removeProTrans.end();
					}
				} else {
					const { data } = results.getProject;
					if (Object.prototype.hasOwnProperty.call(data, '_id')) delete data._id;
					if (Object.prototype.hasOwnProperty.call(data, 'services'))
						data.services.forEach((x) => delete x._id);
					if (Object.prototype.hasOwnProperty.call(data, 'networks'))
						data.networks.forEach((x) => delete x._id);
					if (Object.prototype.hasOwnProperty.call(data, 'volumes'))
						data.volumes.forEach((x) => delete x._id);
					resolve({ status: results.getProject.status, data });
					if (removeProTrans) {
						removeProTrans.end();
					}
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_project:main_api', process: processData });
};

module.exports = method;
