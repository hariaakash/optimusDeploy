const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = (
	{ authKey, name, projectEasyId, serviceEasyId, networks, repo, enablePublic, port, image },
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
				checkServiceExists: [
					'checkAuth',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:exists_orchestrator',
							data: { easyId: serviceEasyId },
						}).then((res) => {
							if (res.status === 404) cb();
							else if (res.status === 200)
								cb('checkServiceExists', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkServiceExists');
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
				checkRepoExists: [
					'checkAuth',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_profile:repos_orchestrator',
							data: { _id: results.checkAuth._id, source: repo.source },
						}).then((res) => {
							if (res.status === 200) {
								if (res.data[repo.source].some(({ repo: x }) => x === repo.name))
									cb();
								else
									cb('checkRepoExists', {
										status: 404,
										data: { msg: 'Repo not found.' },
									});
							} else
								cb('checkRepoExists', {
									status: 500,
									data: { msg: 'Unable to confirm repo existence.' },
								});
						});
					},
				],
				createService: [
					'checkProjectExists',
					'checkServiceExists',
					'checkNetworksExists',
					'checkRepoExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:create_orchestrator',
							data: {
								name,
								easyId: serviceEasyId,
								projectId: results.checkProjectExists._id,
								networks: results.checkNetworksExists,
								repo,
								image,
								enablePublic,
								port,
							},
						}).then((res) =>
							res.status === 200 ? cb(null, res.data) : cb('createService')
						);
					},
				],
				saveReference: [
					'createService',
					(results, cb) => {
						send({
							ch,
							queue: 'user_project:serviceCreate_orchestrator',
							data: {
								projectId: results.checkProjectExists._id,
								serviceId: results.createService.serviceId,
							},
						});
						send({
							ch,
							queue: 'user_service:hookCreate_orchestrator',
							data: {
								_id: results.checkAuth._id,
								projectId: results.checkProjectExists._id,
								easyId: serviceEasyId,
								repo,
								accessToken:
									results.checkAuth.conf.social[repo.source].access_token,
							},
						});
						send({
							ch,
							queue: 'container_volume:create_orchestrator',
							data: {
								projectId: results.checkProjectExists._id,
								volumeId: results.createService.serviceId,
							},
						});
						send({
							ch,
							queue: 'container_git:clone_orchestrator',
							data: {
								aFunction: false,
								projectId: results.checkProjectExists._id,
								volumeId: results.createService.serviceId,
								accessToken:
									results.checkAuth.conf.social[repo.source].access_token,
								repo: repo.name,
								branch: repo.branch,
								source: repo.source,
							},
						});
						const pathPrefixStrip = `PathPrefixStrip:/${serviceEasyId}`;
						const mainDomain = Production
							? results.checkProjectExists.info.domains.default.domain
							: 'local';
						send({
							ch,
							queue: 'container_service:create_orchestrator',
							data: {
								name: `${projectEasyId}_${serviceEasyId}`,
								enablePublic,
								domain: `${projectEasyId}.${mainDomain};${pathPrefixStrip}`,
								port,
								image,
								projectId: results.checkProjectExists._id,
								serviceId: results.createService.serviceId,
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
							'checkServiceExists',
							'checkNetworksExists',
							'checkRepoExists',
							'createService',
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
							msg: 'Service created successfully.',
							serviceEasyId: Production ? undefined : serviceEasyId,
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_service:create_api', process: processData });
};

module.exports = method;
