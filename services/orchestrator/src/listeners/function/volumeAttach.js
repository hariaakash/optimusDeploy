const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId, functionEasyId, volumeEasyId }, ch) =>
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
								if (res.data.volumes.some((x) => x.easyId === volumeEasyId))
									cb('checkFunctionExists', {
										status: 403,
										data: { msg: 'Volume is already attached to function.' },
									});
								else cb(null, res.data);
							else if (res.status === 404) cb('checkFunctionExists', res);
							else cb('checkFunctionExists');
						});
					},
				],
				checkVolumeExists: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_volume:exists_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								easyId: volumeEasyId,
							},
						}).then((res) => {
							if (res.status === 200) cb(null, res.data);
							else if (res.status === 404) cb('checkVolumeExists', res);
							else cb('checkVolumeExists');
						});
					},
				],
				attachVolumeDB: [
					'checkFunctionExists',
					'checkVolumeExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_function:volumeAttach_orchestrator',
							data: {
								easyId: functionEasyId,
								projectId: results.checkProjectExists.projectId,
								volumeId: results.checkVolumeExists.volumeId,
							},
						}).then((res) =>
							res.status === 200 ? cb(null, res) : cb('attachVolumeDB')
						);
					},
				],
				attachVolume: [
					'attachVolumeDB',
					(results, cb) => {
						const volumes = [];
						const { projectId } = results.checkProjectExists;
						volumes.push({
							Source: `${projectId}/${results.checkFunctionExists._id}`,
							Target: 'app',
						});
						volumes.push({
							Source: `${projectId}/${results.checkVolumeExists.volumeId}`,
							Target: volumeEasyId,
						});
						results.checkFunctionExists.volumes.forEach((x) => {
							volumes.push({ Source: `${projectId}/${x._id}`, Target: x.easyId });
						});
						send({
							ch,
							queue: 'container_function:volume_orchestrator',
							data: {
								name: `${projectEasyId}_function_${functionEasyId}`,
								volumes,
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
							'checkVolumeExists',
							'attachVolumeDB',
							'attachVolume',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else resolve(results.attachVolumeDB);
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_function:volumeAttach_api', process: processData });
};

module.exports = method;