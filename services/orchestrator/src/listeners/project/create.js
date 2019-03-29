const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, name, easyId }, ch) =>
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
							data: { easyId },
						}).then((res) => {
							if (res.status === 404) cb(null);
							else if (res.status === 200)
								cb('checkProjectExists', {
									status: 404,
									data: { msg: res.data.msg },
								});
							else cb('checkProjectExists');
						});
					},
				],
				createProject: [
					'checkProjectExists',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_project:create_orchestrator',
							data: { name, easyId, userId: results.checkAuth._id },
						}).then((res) => (res.status === 200 ? cb(null, res.data) : cb('create')));
					},
				],
				createDefaultNetwork: [
					'createProject',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_network:create_orchestrator',
							data: {
								projectId: results.createProject.projectId,
								name: 'Default',
								easyId: `${easyId}_default`,
							},
						}).then((res) =>
							res.status === 200 ? cb(null, res.data) : cb('createDefaultNetwork')
						);
						send({
							ch,
							queue: 'container_network:create_orchestrator',
							data: { name: `${easyId}_default` },
						});
					},
				],
				saveReference: [
					'createDefaultNetwork',
					(results, cb) => {
						send({
							ch,
							queue: 'user_profile:projectCreate_orchestrator',
							data: {
								userId: results.checkAuth._id,
								projectId: results.createProject.projectId,
							},
						});
						send({
							ch,
							queue: 'user_project:networkCreate_orchestrator',
							data: {
								projectId: results.createProject.projectId,
								networkId: results.createDefaultNetwork.networkId,
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
							'createProject',
							'createDefaultNetwork',
							'saveReference',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else
					resolve({
						status: 200,
						data: {
							msg: 'Project created successfully.',
							projectEasyId: Production ? undefined : easyId,
							projectId: Production ? undefined : results.createProject.projectId,
						},
					});
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_project:create_api', process: processData });
};

module.exports = method;
