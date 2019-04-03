const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId, serviceEasyId }, ch) =>
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
				getService: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:main_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								easyId: serviceEasyId,
							},
						}).then((res) => {
							if (res.status === 404) cb('getService', res);
							else if (res.status === 200) cb(null, res.data);
							else cb('getService');
						});
					},
				],
			},
			(err, results) => {
				if (err) {
					if (
						['checkAuth', 'checkProjectExists', 'getService'].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					const service = results.getService;
					delete service._id;
					if (Object.prototype.hasOwnProperty.call(service.info, 'repo')) {
						delete service.info.repo.hookId;
						delete service.info.repo.enabled;
					}
					service.networks = service.networks.map((x) => ({
						name: x.name,
						easyId: x.easyId,
					}));
					resolve({
						status: 200,
						data: service,
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_service:main_api', process: processData });
};

module.exports = method;
