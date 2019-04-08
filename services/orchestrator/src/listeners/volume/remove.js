const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId, volumeEasyId }, ch) =>
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
							else if (res.status === 404)
								cb('checkVolumeExists', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkVolumeExists');
						});
					},
				],
				checkVolumeUsage: [
					'checkVolumeExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:volumeUsage_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								volumeId: results.checkVolumeExists.volumeId,
							},
						}).then((res) => {
							if (res.status === 404) cb();
							else if (res.status === 200)
								cb('checkVolumeUsage', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkVolumeUsage');
						});
					},
				],
				removeVolume: [
					'checkVolumeUsage',
					(results, cb) => {
						send({
							ch,
							queue: 'user_volume:remove_orchestrator',
							data: { volumeId: results.checkVolumeExists.volumeId },
						});
						send({
							ch,
							queue: 'container_volume:remove_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								volumeId: results.checkVolumeExists.volumeId,
							},
						});
						send({
							ch,
							queue: 'user_project:volumeRemove_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								volumeId: results.checkVolumeExists.volumeId,
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
							'checkVolumeExists',
							'checkVolumeUsage',
							'removeVolume',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					resolve({
						status: 200,
						data: {
							msg: 'Volume removed successfully.',
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_volume:remove_api', process: processData });
};

module.exports = method;
