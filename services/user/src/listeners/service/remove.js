const Service = require('../../schemas/service');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, serviceId }) =>
	new Promise((resolve) => {
		if (projectId)
			Service.find({ project: projectId }).then((services) => {
				services.forEach((x) => x.remove());
				resolve(true);
			});
		else
			Service.findOne({ _id: serviceId }).then((service) => {
				if (service) service.remove();
				else resolve(true);
			});
	});

const method = (ch) => {
	assert({ ch, queue: 'user_service:remove_orchestrator' });
	consume({ ch, queue: 'user_service:remove_orchestrator', process: processData });
};

module.exports = method;
