const apm = require('elastic-apm-node');
const async = require('async');

const Production = process.env.NODE_ENV !== 'development';

const { send, rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, name, easyId }, ch) =>
	new Promise((resolve) => {
		const createProTrans = apm.startTransaction('Orchestration: User: Create-Project');
		async.auto(
			{
				checkAuth: [
					(cb) => {
						const checkAuthSpan = createProTrans.startSpan(
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
						const checkProSpan = createProTrans.startSpan(
							'AMQP Call: user_project:exists_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_project:exists_orchestrator',
							data: { easyId },
						})
							.then((res) => {
								if (res.status === 404) cb(null);
								else if (res.status === 200)
									cb('checkProjectExists', {
										status: 404,
										data: { msg: res.data.msg },
									});
								else cb('checkProjectExists');
							})
							.then(() => {
								if (checkProSpan) {
									checkProSpan.end();
								}
							});
					},
				],
				createProject: [
					'checkProjectExists',
					(results, cb) => {
						const createProSpan = createProTrans.startSpan(
							'AMQP Call: user_project:create_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_project:create_orchestrator',
							data: { name, easyId, userId: results.checkAuth._id },
						})
							.then((res) => (res.status === 200 ? cb(null, res.data) : cb('create')))
							.then(() => {
								if (createProSpan) {
									createProSpan.end();
								}
							});
					},
				],
				createDefaultNetwork: [
					'createProject',
					(results, cb) => {
						const createNetworkUser = createProTrans.startSpan(
							'AMQP Call: user_network:create_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_network:create_orchestrator',
							data: {
								projectId: results.createProject.projectId,
								name: 'Default',
								easyId: 'default',
							},
						})
							.then((res) =>
								res.status === 200 ? cb(null, res.data) : cb('createDefaultNetwork')
							)
							.then(() => {
								if (createNetworkUser) {
									createNetworkUser.end();
								}
							});

						const createNetworkContainer = createProTrans.startSpan(
							'container_network:create_orchestrator'
						);
						send({
							ch,
							queue: 'container_network:create_orchestrator',
							data: { name: `${easyId}_default` },
						}).then(() => {
							if (createNetworkContainer) {
								createNetworkContainer.end();
							}
						});
					},
				],
				saveReference: [
					'createDefaultNetwork',
					(results, cb) => {
						const saveRefProfileSpan = createProTrans.startSpan(
							'AMQP Call: user_profile:projectCreate_orchestrator'
						);
						send({
							ch,
							queue: 'user_profile:projectCreate_orchestrator',
							data: {
								userId: results.checkAuth._id,
								projectId: results.createProject.projectId,
							},
						}).then(() => {
							if (saveRefProfileSpan) {
								saveRefProfileSpan.end();
							}
						});

						const saveRefProjectSpan = createProTrans.startSpan(
							'AMQP Call: user_project:networkCreate_orchestrator'
						);
						send({
							ch,
							queue: 'user_project:networkCreate_orchestrator',
							data: {
								projectId: results.createProject.projectId,
								networkId: results.createDefaultNetwork.networkId,
							},
						}).then(() => {
							if (saveRefProjectSpan) {
								saveRefProjectSpan.end();
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
							'createProject',
							'createDefaultNetwork',
							'saveReference',
						].includes(err) &&
						!!results[err]
					)
						resolve(results[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
					if (createProTrans) {
						createProTrans.end();
					}
				} else {
					resolve({
						status: 200,
						data: {
							msg: 'Project created successfully.',
							projectEasyId: Production ? undefined : easyId,
						},
					});
					if (createProTrans) {
						createProTrans.end();
					}
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_project:create_api', process: processData });
};

module.exports = method;
