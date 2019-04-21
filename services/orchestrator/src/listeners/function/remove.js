const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

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
				checkFunctionExists: [
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
							if (res.status === 404) cb('checkFunctionExists', res);
							else if (res.status === 200) cb(null, res.data);
							else cb('checkFunctionExists');
						});
					},
				],
				removeFunction: [
					'checkFunctionExists',
					(results, cb) => {
						send({
							ch,
							queue: 'user_function:remove_orchestrator',
							data: {
								functionId: results.checkFunctionExists._id,
							},
						});
						cb();
					},
				],
				cleanupTask: [
					'removeFunction',
					(results, cb) => {
						send({
							ch,
							queue: 'user_project:functionRemove_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								functionId: results.checkFunctionExists._id,
							},
						});
						send({
							ch,
							queue: 'user_function:hookRemove_orchestrator',
							data: {
								accessTokens: results.checkAuth.conf.social,
								functions: [results.checkFunctionExists],
							},
						});
						send({
							ch,
							queue: 'container_volume:remove_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								volumeId: results.checkFunctionExists._id,
							},
						});
						send({
							ch,
							queue: 'container_function:remove_orchestrator',
							data: { names: [`${projectEasyId}_function_${functionEasyId}`] },
						});
						cb();
					},
				],
			},
			(err, results) => {
				if (err) {
					if (
						[
							'checkAuth',
							'checkProjectExists',
							'checkFunctionExists',
							'removeFunction',
							'cleanupTask',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else
					resolve({
						status: 200,
						data: {
							msg: 'Function removed successfully.',
						},
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_function:remove_api', process: processData });
};

module.exports = method;
