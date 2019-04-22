const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId, functionEasyId }, ch) =>
	new Promise((resolve) => {
		async.auto(
			{
				checkAuth: [
					(cb) => {
						rpcSend({
							ch,
							queue: 'user_profile:main_orchestrator',
							data: { authKey },
						}).then((res) => {
							if (res.status === 200) cb(null, res.data);
							else if ([401, 404].includes(res.status)) cb('checkAuth', res);
							else cb('checkAuth');
						});
					},
				],
				checkProjectExists: [
					'checkAuth',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_project:exists_orchestrator',
							data: { easyId: projectEasyId },
						}).then((res) => {
							if (res.status === 200)
								if (
									results.checkAuth.projects.some(
										(x) => x._id === res.data.projectId
									)
								)
									cb(null, res.data);
								else
									cb('checkProjectExists', {
										status: 404,
										data: { msg: res.data.msg },
									});
							else if (res.status === 404) cb('checkProjectExists', res);
							else cb('checkProjectExists');
						});
					},
				],
				getFunction: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_function:main_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								easyId: functionEasyId,
							},
						}).then((res) => {
							if (res.status === 404) cb('getFunction', res);
							else if (res.status === 200) cb(null, res.data);
							else cb('getFunction');
						});
					},
				],
			},
			(err, results) => {
				if (err) {
					if (
						['checkAuth', 'checkProjectExists', 'getFunction'].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					const aFunction = results.getFunction;
					delete aFunction._id;
					aFunction.networks = aFunction.networks.map((x) => ({
						name: x.name,
						easyId: x.easyId,
					}));
					aFunction.volumes = aFunction.volumes.map((x) => ({
						name: x.name,
						easyId: x.easyId,
					}));
					resolve({
						status: 200,
						data: aFunction,
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_function:main_api', process: processData });
};

module.exports = method;
