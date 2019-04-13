const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId, serviceEasyId, enablePublic }, ch) =>
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
				checkServiceExists: [
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
							if (res.status === 200) cb(null, res.data);
							else if (res.status === 404) cb('checkServiceExists', res);
							else cb('checkServiceExists');
						});
					},
				],
				enablePublicCheck: [
					'checkServiceExists',
					(results, cb) => {
						if (results.checkServiceExists.info.enablePublic)
							if (enablePublic)
								cb('enablePublicCheck', {
									status: 403,
									data: { msg: 'Service is already public.' },
								});
							else cb();
						else if (enablePublic) cb();
						else
							cb('enablePublicCheck', {
								status: 403,
								data: { msg: 'Service is already private.' },
							});
					},
				],
				enablePublic: [
					'enablePublicCheck',
					(results, cb) => {
						send({
							ch,
							queue: 'user_service:enablePublic_orchestrator',
							data: { easyId: serviceEasyId, enablePublic },
						});
						send({
							ch,
							queue: 'container_service:enablePublic_orchestrator',
							data: { name: `${projectEasyId}_${serviceEasyId}`, enablePublic },
						});
						send({
							ch,
							queue: 'container_service:network_orchestrator',
							data: {
								name: `${projectEasyId}_${serviceEasyId}`,
								networks: results.checkServiceExists.networks.map(
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
							'checkServiceExists',
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
							msg: `Service made ${
								enablePublic ? 'public' : 'private'
							} successfully.`,
						},
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_service:enablePublic_api', process: processData });
};

module.exports = method;
