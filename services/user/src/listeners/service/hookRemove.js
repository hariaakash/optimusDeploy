const async = require('async');

const Service = require('../../schemas/service');

const { Github } = require('../../helpers/social');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ accessTokens, projectId, serviceId }) =>
	new Promise(async (resolve) => {
		const queryOpts = { project: projectId };
		if (serviceId) queryOpts._id = serviceId;
		const services = await Service.find(queryOpts);
		async.each(
			services,
			(service, cb) => {
				if (service.info.repo.enabled)
					if (service.info.repo.source === 'github')
						Github.hook
							.remove({
								accessToken: accessTokens[service.info.repo.source].access_token,
								repo: service.info.repo.name,
								hookId: service.info.repo.hookId,
							})
							.then(cb(null))
							.catch(cb);
					else cb();
				else cb();
			},
			(err) => {
				if (err) resolve();
				else resolve(true);
			}
		);
	});

const method = (ch) => {
	assert({ ch, queue: 'user_service:hookRemove_orchestrator' });
	consume({ ch, queue: 'user_service:hookRemove_orchestrator', process: processData });
};

module.exports = method;
