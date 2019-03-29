const Project = require('../../schemas/project');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, networkId }) =>
	new Promise((resolve, reject) => {
		Project.findOne({ _id: projectId })
			.then((project) => {
				if (project) {
					project.networks = project.networks.filter((x) => String(x) !== networkId);
					project.save().then(() => resolve(true));
				} else resolve(true);
			})
			.catch((err) => reject);
	});

const method = (ch) => {
	assert({ ch, queue: 'user_project:networkRemove_orchestrator' });
	consume({ ch, queue: 'user_project:networkRemove_orchestrator', process: processData });
};

module.exports = method;
