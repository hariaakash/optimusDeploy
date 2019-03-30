const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, name, projectEasyId, networkEasyId }, ch) =>
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
							if (res.status === 200) cb(null, res.data);
							else if (res.status === 404) cb('checkProjectExists', res);
							else cb('checkProjectExists');
						});
					},
				],
				checkNetworkExists: [
					'checkAuth',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_network:exists_orchestrator',
							data: { easyId: networkEasyId },
						}).then((res) => {
							if (res.status === 404) cb();
							else if (res.status === 200)
								cb('checkNetworkExists', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkNetworkExists');
						});
					},
				],
				createNetwork: [
					'checkProjectExists',
					'checkNetworkExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_network:create_orchestrator',
							data: {
								name,
								easyId: networkEasyId,
								projectId: results.checkProjectExists.projectId,
							},
						}).then((res) =>
							res.status === 200 ? cb(null, res.data) : cb('createNetwork')
						);
						send({
							ch,
							queue: 'container_network:create_orchestrator',
							data: { name: `${projectEasyId}_${networkEasyId}` },
						});
					},
				],
				saveReference: [
					'createNetwork',
					(results, cb) => {
						send({
							ch,
							queue: 'user_project:networkCreate_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								networkId: results.createNetwork.networkId,
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
							'createNetwork',
							'saveReference',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					resolve({
						status: 200,
						data: {
							msg: 'Network created successfully.',
							networkEasyId: Production ? undefined : networkEasyId,
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_network:create_api', process: processData });
};

module.exports = method;
