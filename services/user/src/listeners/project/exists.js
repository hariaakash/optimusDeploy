const Project = require('../../schemas/project');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, userId }) =>
	new Promise((resolve) => {
		Project.findOne({ name, userId }).then((project) => {
			if (project)
				resolve({
					status: 200,
					data: { projectId: project._id, msg: 'Project already exists.' },
				});
			else resolve({ status: 404, data: { msg: 'Project not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_project:exists_orchestrator', process: processData });
};

module.exports = method;
