const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, name, projectEasyId, volumeEasyId }, ch) =>
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
				checkVolumeExists: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_volume:exists_orchestrator',
							data: {
								easyId: volumeEasyId,
								projectId: results.checkProjectExists.projectId,
							},
						}).then((res) => {
							if (res.status === 404) cb();
							else if (res.status === 200)
								cb('checkVolumeExists', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkVolumeExists');
						});
					},
				],
				createVolume: [
					'checkVolumeExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_volume:create_orchestrator',
							data: {
								name,
								easyId: volumeEasyId,
								projectId: results.checkProjectExists.projectId,
							},
						}).then((res) =>
							res.status === 200 ? cb(null, res.data) : cb('createVolume')
						);
					},
				],
				saveReference: [
					'createVolume',
					(results, cb) => {
						send({
							ch,
							queue: 'user_project:volumeCreate_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								volumeId: results.createVolume.volumeId,
							},
						});
						send({
							ch,
							queue: 'container_volume:create_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								volumeId: results.createVolume.volumeId,
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
							'createVolume',
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
							msg: 'Volume created successfully.',
							volumeEasyId: Production ? undefined : volumeEasyId,
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_volume:create_api', process: processData });
};

module.exports = method;
