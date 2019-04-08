const Project = require('../../schemas/project');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, volumeId }) =>
	new Promise((resolve, reject) => {
		Project.findOne({ _id: projectId })
			.then((project) => {
				if (project) {
					project.volumes.push(volumeId);
					project.save().then(() => resolve(true));
				} else resolve(true);
			})
			.catch((err) => reject);
	});

const method = (ch) => {
	assert({ ch, queue: 'user_project:volumeCreate_orchestrator' });
	consume({ ch, queue: 'user_project:volumeCreate_orchestrator', process: processData });
};

module.exports = method;
