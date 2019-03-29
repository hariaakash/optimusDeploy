const Project = require('../../schemas/project');
const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ serviceId }) =>
	new Promise((resolve) => {
		Service.findOne({ _id: serviceId }).then((service) => {
			if (service)
				service.remove().then(() =>
					resolve({
						status: 200,
						data: {
							msg: 'Project removed.',
						},
					})
				);
			else resolve({ status: 404, data: { msg: 'Service not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:remove_orchestrator', process: processData });
};

module.exports = method;
