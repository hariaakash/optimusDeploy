const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId, networkEasyId }, ch) =>
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
								if (results.checkAuth.projects.includes(res.data.projectId))
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
							else if (res.status === 404)
								cb('checkNetworkExists', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkNetworkExists');
						});
					},
				],
				checkNetworkUsage: [
					'checkNetworkExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:networkUsage_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								networkId: results.checkNetworkExists.networkId,
							},
						}).then((res) => {
							if (res.status === 404) cb();
							else if (res.status === 200)
								cb('checkNetworkUsage', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkNetworkUsage');
						});
					},
				],
				removeNetwork: [
					'checkNetworkUsage',
					(results, cb) => {
						send({
							ch,
							queue: 'user_network:remove_orchestrator',
							data: { networkId: results.checkNetworkExists.networkId },
						});
						send({
							ch,
							queue: 'container_network:remove_orchestrator',
							data: { names: [`${projectEasyId}_${networkEasyId}`] },
						});
						send({
							ch,
							queue: 'user_project:networkRemove_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								networkId: results.checkNetworkExists.networkId,
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
							'checkNetworkExists',
							'checkNetworkUsage',
							'removeNetwork',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					resolve({
						status: 200,
						data: {
							msg: 'Network removed successfully.',
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_network:remove_api', process: processData });
};

module.exports = method;
