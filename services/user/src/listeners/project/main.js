const Project = require('../../schemas/project');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ userId, easyId }) =>
	new Promise((resolve) => {
		Project.findOne({ easyId, user: userId })
			.populate('services', 'easyId name')
			.populate('networks', 'easyId name')
			.select('name easyId services networks info')
			.then((project) => {
				if (project) resolve({ status: 200, data: project });
				else resolve({ status: 404, data: { msg: 'Project not found.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_project:main_orchestrator', process: processData });
};

module.exports = method;
