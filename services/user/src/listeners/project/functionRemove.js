const Project = require('../../schemas/project');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, functionId }) =>
	new Promise((resolve, reject) => {
		Project.findOne({ _id: projectId })
			.then((project) => {
				if (project) {
					project.functions = project.functions.filter((x) => String(x) !== functionId);
					project.save().then(() => resolve(true));
				} else resolve(true);
			})
			.catch((err) => reject);
	});

const method = (ch) => {
	assert({ ch, queue: 'user_project:functionRemove_orchestrator' });
	consume({ ch, queue: 'user_project:functionRemove_orchestrator', process: processData });
};

module.exports = method;
