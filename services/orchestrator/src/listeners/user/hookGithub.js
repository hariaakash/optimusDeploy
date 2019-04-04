const async = require('async');

const { send, rpcConsume, rpcSend } = require('../../helpers/amqp-wrapper');

const processData = ({ serviceId, ref, repository }, ch) =>
	new Promise((resolve) => {
		if (typeof ref === 'string' && typeof repository === 'object') {
			const branch = ref.split('/')[2];
			const repo = repository.full_name;
			async.auto(
				{
					checkService: [
						(cb) => {
							rpcSend({
								ch,
								queue: 'user_service:existsRepo_orchestrator',
								data: { serviceId, repo, branch },
							}).then((res) => {
								if (res.status === 200) cb(null, res.data);
								else if (res.status === 404) cb('checkServiceExists', res);
								else cb('checkServiceExists');
							});
						},
					],
					findUser: [
						'checkService',
						(results, cb) => {
							rpcSend({
								ch,
								queue: 'user_profile:existsProject_orchestrator',
								data: { projectId: results.checkService.project },
							}).then((res) => {
								if (res.status === 200) cb(null, res.data);
								else if (res.status === 404) cb('findUser', res);
								else cb('findUser');
							});
						},
					],
					decide: [
						'checkService',
						(results, cb) => {
							if (!results.checkService.info.repo.auto)
								cb('decide', { status: 200, data: { msg: 'Auto pull disabled.' } });
							else cb();
						},
					],
					updateService: [
						'findUser',
						'decide',
						(results, cb) => {
							send({
								ch,
								queue: 'container_git:pull_orchestrator',
								data: {
									projectId: results.checkService.project,
									serviceId,
									accessToken: results.findUser.conf.social.github.access_token,
									repo: results.checkService.info.repo.name,
									branch: results.checkService.info.repo.branch,
									source: 'github',
								},
							});
							const projectIndex = results.findUser.projects.findIndex(
								(x) => x._id === results.checkService.project
							);
							const projectEasyId = results.findUser.projects[projectIndex].easyId;
							send({
								ch,
								queue: 'container_service:restart_orchestrator',
								data: { name: `${projectEasyId}_${results.checkService.easyId}` },
							});
							cb();
						},
					],
				},
				(err, results) => {
					if (err) {
						if (['checkService', 'findUser', 'decide'].includes(err) && !!results[err])
							resolve(results[err]);
						else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
					} else {
						resolve({
							status: 200,
							data: {
								msg: 'Service updated successfully.',
							},
						});
					}
				}
			);
		} else resolve({ status: 200, data: { msg: 'Webhook works fine.' } });
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:hookGithub_api', process: processData });
};

module.exports = method;
