const Project = require('../../schemas/project');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, serviceId }) =>
	new Promise((resolve, reject) => {
		Project.findOne({ _id: projectId })
			.then((project) => {
				if (project) {
					project.services = project.services.filter((x) => String(x) !== serviceId);
					project.save().then(() => resolve(true));
				} else resolve(true);
			})
			.catch((err) => reject);
	});

const method = (ch) => {
	assert({ ch, queue: 'user_project:serviceRemove_orchestrator' });
	consume({ ch, queue: 'user_project:serviceRemove_orchestrator', process: processData });
};

module.exports = method;
