const Project = require('../../schemas/project');
const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId }) =>
	new Promise((resolve) => {
		Project.findOne({ _id: projectId })
			.populate('networks services')
			.then((project) => {
				if (project)
					project.remove().then(() =>
						resolve({
							status: 200,
							data: {
								msg: 'Project removed.',
								networks: project.networks.map((x) => ({ easyId: x.easyId })),
								services: project.services.map((x) => ({ easyId: x.easyId })),
							},
						})
					);
				else resolve({ status: 404, data: { msg: 'Project not found.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_project:remove_orchestrator', process: processData });
};

module.exports = method;
