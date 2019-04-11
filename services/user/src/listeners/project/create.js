const { ObjectId } = require('mongoose').Types;

const Project = require('../../schemas/project');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, userId, easyId, defaultDomain }) =>
	new Promise((resolve) => {
		const project = new Project({
			_id: ObjectId(),
			name,
			user: userId,
			easyId,
			'info.domains.default': defaultDomain,
		});
		project.save().then(() => resolve({ status: 200, data: { projectId: project._id } }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_project:create_orchestrator', process: processData });
};

module.exports = method;
