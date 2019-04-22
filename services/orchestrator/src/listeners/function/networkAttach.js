const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId, functionEasyId, networkEasyId }, ch) =>
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
							if (res.status === 200)
								if (res.data.networks.some((x) => x.easyId === networkEasyId))
									cb('checkFunctionExists', {
										status: 403,
										data: { msg: 'Network is already attached to function.' },
									});
								else cb(null, res.data);
							else if (res.status === 404) cb('checkFunctionExists', res);
							else cb('checkFunctionExists');
						});
					},
				],
				checkNetworkExists: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_network:exists_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								easyId: networkEasyId,
							},
						}).then((res) => {
							if (res.status === 200) cb(null, res.data);
							else if (res.status === 404) cb('checkNetworkExists', res);
							else cb('checkNetworkExists');
						});
					},
				],
				attachNetworkDB: [
					'checkFunctionExists',
					'checkNetworkExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_function:networkAttach_orchestrator',
							data: {
								easyId: functionEasyId,
								projectId: results.checkProjectExists.projectId,
								networkId: results.checkNetworkExists.networkId,
							},
						}).then((res) =>
							res.status === 200 ? cb(null, res) : cb('attachNetworkDB')
						);
					},
				],
				attachNetwork: [
					'attachNetworkDB',
					(results, cb) => {
						const networks = results.checkFunctionExists.networks.map(
							(x) => `${projectEasyId}_${x.easyId}`
						);
						networks.push(`${projectEasyId}_${networkEasyId}`);
						send({
							ch,
							queue: 'container_function:network_orchestrator',
							data: {
								name: `${projectEasyId}_function_${functionEasyId}`,
								networks,
								enablePublic: results.checkFunctionExists.info.enablePublic,
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
							'checkNetworkExists',
							'attachNetworkDB',
							'attachNetwork',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else resolve(results.attachNetworkDB);
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_function:networkAttach_api', process: processData });
};

module.exports = method;
