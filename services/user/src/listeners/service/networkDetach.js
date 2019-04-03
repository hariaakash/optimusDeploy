const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId, networkId }) =>
	new Promise((resolve) => {
		Service.findOne({ easyId, project: projectId }).then((service) => {
			if (service) {
				service.networks = service.networks.filter((x) => String(x) !== networkId);
				service.save().then(() =>
					resolve({
						status: 200,
						data: { msg: 'Network detached from service successfully' },
					})
				);
			} else resolve({ status: 404, data: { msg: 'Service not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:networkDetach_orchestrator', process: processData });
};

module.exports = method;
