const apm = require('elastic-apm-node');
const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId }, ch) =>
	new Promise((resolve) => {
		const removeProTrans = apm.startTransaction('Orchestration: User: Create-Project');
		async.auto(
			{
				checkAuth: [
					(cb) => {
						const checkAuthSpan = removeProTrans.startSpan(
							'AMQP Call: user_profile:main_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_profile:main_orchestrator',
							data: { authKey },
						})
							.then((res) => {
								if (res.status === 200) cb(null, res.data);
								else if ([401, 404].includes(res.status)) cb('checkAuth', res);
								else cb('checkAuth');
							})
							.then(() => {
								if (checkAuthSpan) {
									checkAuthSpan.end();
								}
							});
					},
				],
				checkProjectExists: [
					'checkAuth',
					(results, cb) => {
						const checkProExSpan = removeProTrans.startSpan(
							'AMQP Call: user_project:exists_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_project:exists_orchestrator',
							data: { easyId: projectEasyId },
						})
							.then((res) => {
								if (res.status === 404)
									cb('checkProjectExists', {
										status: 404,
										data: { msg: 'Project not found.' },
									});
								else if (res.status === 200)
									if (results.checkAuth.projects.includes(res.data.projectId))
										cb(null, res.data);
									else
										cb('checkProjectExists', {
											status: 404,
											data: { msg: res.data.msg },
										});
								else cb('checkProjectExists');
							})
							.then(() => {
								if (checkProExSpan) {
									checkProExSpan.end();
								}
							});
					},
				],
				removeProject: [
					'checkProjectExists',
					(results, cb) => {
						const remProSpan = removeProTrans.startSpan(
							'AMQP Call: user_project:remove_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_project:remove_orchestrator',
							data: { projectId: results.checkProjectExists.projectId },
						})
							.then((res) => {
								if (res.status === 200) cb(null, res.data);
								else cb('create');
							})
							.then(() => {
								remProSpan.end();
							});
					},
				],
				cleanupTask: [
					'removeProject',
					(results, cb) => {
						const cleanUpUserDB = removeProTrans.startSpan(
							'AMQP Call: user_profile:projectRemove_orchestrator'
						);
						send({
							ch,
							queue: 'user_profile:projectRemove_orchestrator',
							data: {
								userId: results.checkAuth._id,
								projectId: results.checkProjectExists.projectId,
							},
						}).then(() => {
							if (cleanUpUserDB) {
								cleanUpUserDB.end();
							}
						});
						const cleanUpNetworkDB = removeProTrans.startSpan(
							'AMQP Call: user_network:remove_orchestrator'
						);
						send({
							ch,
							queue: 'user_network:remove_orchestrator',
							data: { projectId: results.checkProjectExists.projectId },
						}).then(() => {
							if (cleanUpNetworkDB) {
								cleanUpNetworkDB.end();
							}
						});
						const cleanUpNetwork = removeProTrans.startSpan(
							'container_network:remove_orchestrator'
						);
						send({
							ch,
							queue: 'container_network:remove_orchestrator',
							data: {
								names: results.removeProject.networks.map(
									(x) => `${projectEasyId}_${x.easyId}`
								),
							},
						}).then(() => {
							if (cleanUpNetwork) {
								cleanUpNetwork.end();
							}
						});
						const cleanUpVolume = removeProTrans.startSpan(
							'AMQP Call: container_volume:projectRemove_orchestrator'
						);
						send({
							ch,
							queue: 'container_volume:projectRemove_orchestrator',
							data: {
								projectId: results.checkProjectExists.projectId,
							},
						}).then(() => {
							if (cleanUpVolume) {
								cleanUpVolume.end();
							}
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
							'removeProject',
							'cleanupTask',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
					if (removeProTrans) {
						removeProTrans.end();
					}
				} else {
					resolve({
						status: 200,
						data: {
							msg: 'Project removed successfully.',
						},
					});
					if (removeProTrans) {
						removeProTrans.end();
					}
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_project:remove_api', process: processData });
};

module.exports = method;
