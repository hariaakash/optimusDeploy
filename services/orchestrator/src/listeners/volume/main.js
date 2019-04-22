const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

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
				getVolume: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_volume:main_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								easyId: volumeEasyId,
							},
						}).then((res) => {
							if (res.status === 200) cb(null, res.data);
							else if (res.status === 404) cb('getVolume', res);
							else cb('getVolume');
						});
					},
				],
				checkVolumeServiceUsage: [
					'getVolume',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_service:volumeUsage_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								volumeId: results.getVolume._id,
							},
						}).then((res) => {
							if ([404, 200].includes(res.status)) cb(null, res.data);
							else cb('checkVolumeServiceUsage');
						});
					},
				],
				checkVolumeFunctionUsage: [
					'getVolume',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_function:volumeUsage_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
								volumeId: results.getVolume._id,
							},
						}).then((res) => {
							if ([404, 200].includes(res.status)) cb(null, res.data);
							else cb('checkVolumeFunctionUsage');
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
							'getVolume',
							'checkVolumeServiceUsage',
							'checkVolumeFunctionUsage',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else {
					let services = [];
					if (results.checkVolumeServiceUsage.services)
						services = results.checkVolumeServiceUsage.services.map((x) => ({
							name: x.name,
							easyId: x.easyId,
						}));
					let functions = [];
					if (results.checkVolumeFunctionUsage.functions)
						functions = results.checkVolumeFunctionUsage.functions.map((x) => ({
							name: x.name,
							easyId: x.easyId,
						}));
					resolve({
						status: 200,
						data: {
							name: results.getVolume.name,
							easyId: results.getVolume.easyId,
							services,
							functions,
						},
					});
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_volume:main_api', process: processData });
};

module.exports = method;
