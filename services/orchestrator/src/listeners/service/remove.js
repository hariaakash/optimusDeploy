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
				checkServiceExists: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:exists_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								easyId: serviceEasyId,
							},
						}).then((res) => {
							if (res.status === 404) cb('checkServiceExists', res);
							else if (res.status === 200) cb(null, res.data);
							else cb('checkServiceExists');
						});
					},
				],
				removeService: [
					'checkServiceExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:remove_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								serviceId: results.checkServiceExists.serviceId,
							},
						}).then((res) => {
							if (res.status === 200) cb(null, res.data);
							else if (res.status === 404) cb(null, res.data);
							else cb('create');
						});
					},
				],
				cleanupTask: [
					'removeService',
					(results, cb) => {
						send({
							ch,
							queue: 'user_project:serviceRemove_orchestrator',
							data: {
								projectId: results.checkServiceExists.projectId,
								serviceId: results.checkServiceExists.serviceId,
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
							'removeService',
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
							msg: 'Service removed successfully.',
						},
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_service:remove_api', process: processData });
};

module.exports = method;
