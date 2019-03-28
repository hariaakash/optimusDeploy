const async = require('async');

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, projectEasyId }, ch) =>
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
						});
					},
				],
				removeProject: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_project:remove_orchestrator',
							data: { projectId: results.checkProjectExists.projectId },
						}).then((res) => {
							if (res.status === 200) cb(null, res.data);
							else cb('create');
						});
					},
				],
				cleanupTask: [
					'removeProject',
					(results, cb) => {
						send({
							ch,
							queue: 'user_profile:projectRemove_orchestrator',
							data: {
								userId: results.checkAuth._id,
								projectId: results.checkProjectExists.projectId,
							},
						});
						send({
							ch,
							queue: 'user_network:remove_orchestrator',
							data: { projectId: results.checkProjectExists.projectId },
						});
						send({
							ch,
							queue: 'container_network:remove_orchestrator',
							data: {
								names: results.removeProject.networks.map(
									(x) => `${projectEasyId}_${x.easyId}`
								),
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
							'removeProject',
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
							msg: 'Project removed successfully.',
						},
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_project:remove_api', process: processData });
};

module.exports = method;
