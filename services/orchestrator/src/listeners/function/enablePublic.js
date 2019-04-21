const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId, functionEasyId, enablePublic }, ch) =>
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
							if (res.status === 200) cb(null, res.data);
							else if (res.status === 404) cb('checkFunctionExists', res);
							else cb('checkFunctionExists');
						});
					},
				],
				enablePublicCheck: [
					'checkFunctionExists',
					(results, cb) => {
						if (results.checkFunctionExists.info.enablePublic)
							if (enablePublic)
								cb('enablePublicCheck', {
									status: 403,
									data: { msg: 'Function is already public.' },
								});
							else cb();
						else if (enablePublic) cb();
						else
							cb('enablePublicCheck', {
								status: 403,
								data: { msg: 'Function is already private.' },
							});
					},
				],
				enablePublic: [
					'enablePublicCheck',
					(results, cb) => {
						send({
							ch,
							queue: 'user_function:enablePublic_orchestrator',
							data: { easyId: functionEasyId, enablePublic },
						});
						send({
							ch,
							queue: 'container_function:enablePublic_orchestrator',
							data: {
								name: `${projectEasyId}_function_${functionEasyId}`,
								enablePublic,
							},
						});
						send({
							ch,
							queue: 'container_function:network_orchestrator',
							data: {
								name: `${projectEasyId}_function_${functionEasyId}`,
								networks: results.checkFunctionExists.networks.map(
									(x) => `${projectEasyId}_${x.easyId}`
								),
								enablePublic,
							},
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
							'enablePublicCheck',
							'enablePublic',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else
					resolve({
						status: 200,
						data: {
							msg: `Function made ${
								enablePublic ? 'public' : 'private'
							} successfully.`,
						},
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_function:enablePublic_api', process: processData });
};

module.exports = method;
