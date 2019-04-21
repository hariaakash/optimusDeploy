const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = (
	{ authKey, name, projectEasyId, functionEasyId, networks, enablePublic, image },
	ch
) =>
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
							queue: 'user_project:main_orchestrator',
							data: { userId: results.checkAuth._id, easyId: projectEasyId },
						}).then((res) => {
							if (res.status === 200)
								if (results.checkAuth.projects.some((x) => x._id === res.data._id))
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
					'checkAuth',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_function:exists_orchestrator',
							data: { easyId: functionEasyId },
						}).then((res) => {
							if (res.status === 404) cb();
							else if (res.status === 200)
								cb('checkFunctionExists', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkFunctionExists');
						});
					},
				],
				checkNetworksExists: [
					'checkProjectExists',
					(results, cb) => {
						const networkIds = [];
						async.each(
							networks,
							(networkEasyId, subCb) =>
								rpcSend({
									ch,
									queue: 'user_network:exists_orchestrator',
									data: {
										projectId: results.checkProjectExists._id,
										easyId: networkEasyId,
									},
								}).then((res) => {
									if (res.status === 200) {
										networkIds.push(res.data.networkId);
										subCb();
									} else subCb(networkEasyId);
								}),
							(err) => {
								if (err)
									cb('checkNetworksExists', {
										status: 404,
										data: { msg: `The network ${err} not found.` },
									});
								else cb(null, networkIds);
							}
						);
					},
				],
				createFunction: [
					'checkProjectExists',
					'checkFunctionExists',
					'checkNetworksExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_function:create_orchestrator',
							data: {
								name,
								easyId: functionEasyId,
								projectId: results.checkProjectExists._id,
								networks: results.checkNetworksExists,
								image,
								enablePublic,
							},
						}).then((res) =>
							res.status === 200 ? cb(null, res.data) : cb('createFunction')
						);
					},
				],
				saveReference: [
					'createFunction',
					(results, cb) => {
						send({
							ch,
							queue: 'user_project:functionCreate_orchestrator',
							data: {
								projectId: results.checkProjectExists._id,
								functionId: results.createFunction.functionId,
							},
						});
						send({
							ch,
							queue: 'container_volume:create_orchestrator',
							data: {
								projectId: results.checkProjectExists._id,
								volumeId: results.createFunction.functionId,
							},
						});
						const pathPrefixStrip = `PathPrefixStrip:/function/${functionEasyId}`;
						const mainDomain = Production
							? results.checkProjectExists.info.domains.default.domain
							: 'local';
						send({
							ch,
							queue: 'container_function:create_orchestrator',
							data: {
								projectEasyId,
								name: `${projectEasyId}_function_${functionEasyId}`,
								enablePublic,
								domain: `${projectEasyId}.${mainDomain};${pathPrefixStrip}`,
								image,
								projectId: results.checkProjectExists._id,
								functionId: results.createFunction.functionId,
								networks: networks.map((x) => `${projectEasyId}_${x}`),
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
							'checkNetworksExists',
							'createFunction',
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
							msg: 'Function created successfully.',
							functionEasyId: Production ? undefined : functionEasyId,
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_function:create_api', process: processData });
};

module.exports = method;
