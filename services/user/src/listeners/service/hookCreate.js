const Service = require('../../schemas/service');

const { Github } = require('../../helpers/social');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId, repo, accessToken }) =>
	new Promise(async (resolve) => {
		try {
			const service = await Service.findOne({ easyId, project: projectId });
			if (service) {
				if (repo.source === 'github') {
					const hook = await Github.hook.create({
						serviceId: service._id,
						accessToken,
						repo: repo.name,
					});
					service.info.repo.hookId = hook.id;
					service.save(() => resolve(true));
				} else resolve(true);
			} else resolve(true);
		} catch (err) {
			resolve();
		}
	});

const method = (ch) => {
	assert({ ch, queue: 'user_service:hookCreate_orchestrator' });
	consume({ ch, queue: 'user_service:hookCreate_orchestrator', process: processData });
};

module.exports = method;
