const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

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
								if (
									results.checkAuth.projects.some(
										(x) => x._id === res.data.projectId
									)
								)
									cb(null, res.data);
								else {
									cb('checkProjectExists', {
										status: 404,
										data: { msg: res.data.msg },
									});
								}
							else if (res.status === 404) cb('checkProjectExists', res);
							else cb('checkProjectExists');
						});
					},
				],
				getNetwork: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_network:main_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								easyId: networkEasyId,
							},
						}).then((res) => {
							if (res.status === 200) cb(null, res.data);
							else if (res.status === 404) cb('getNetwork', res);
							else cb('getNetwork');
						});
					},
				],
				checkNetworkUsage: [
					'getNetwork',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:networkUsage_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								networkId: results.getNetwork._id,
							},
						}).then((res) => {
							if ([404, 200].includes(res.status)) cb(null, res.data);
							else cb('checkNetworkUsage');
						});
					},
				],
			},
			(err, results) => {
				if (err) {
					if (
						[
							'checkAuth',
							'checkProjectExists',
							'getNetwork',
							'checkNetworkUsage',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					let services = [];
					if (results.checkNetworkUsage.services)
						services = results.checkNetworkUsage.services.map((x) => ({
							name: x.name,
							easyId: x.easyId,
						}));
					resolve({
						status: 200,
						data: {
							name: results.getNetwork.name,
							easyId: results.getNetwork.easyId,
							services,
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_network:main_api', process: processData });
};

module.exports = method;
