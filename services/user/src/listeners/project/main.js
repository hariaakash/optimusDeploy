const Project = require('../../schemas/project');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const selectOpts = [
	'name',
	'easyId',
	'services',
	'networks',
	'volumes',
	'info.domains.default.domain',
];

const processData = ({ userId, easyId }) =>
	new Promise((resolve) => {
		Project.findOne({ easyId, user: userId })
			.populate('services', 'easyId name')
			.populate('functions', 'easyId name')
			.populate('networks', 'easyId name')
			.populate('volumes', 'easyId name')
			.select(selectOpts)
			.then((project) => {
				if (project) resolve({ status: 200, data: project });
				else resolve({ status: 404, data: { msg: 'Project not found.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_project:main_orchestrator', process: processData });
};

module.exports = method;
