const Project = require('../../schemas/project');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, volumeId }) =>
	new Promise((resolve, reject) => {
		Project.findOne({ _id: projectId })
			.then((project) => {
				if (project) {
					project.volumes = project.volumes.filter((x) => String(x) !== volumeId);
					project.save().then(() => resolve(true));
				} else resolve(true);
			})
			.catch((err) => reject);
	});

const method = (ch) => {
	assert({ ch, queue: 'user_project:volumeRemove_orchestrator' });
	consume({ ch, queue: 'user_project:volumeRemove_orchestrator', process: processData });
};

module.exports = method;
