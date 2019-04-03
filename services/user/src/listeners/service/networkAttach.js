const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId, networkId }) =>
	new Promise((resolve) => {
		Service.findOne({ easyId, project: projectId }).then((service) => {
			if (service) {
				service.networks.push(networkId);
				service.save().then(() =>
					resolve({
						status: 200,
						data: { msg: 'Network attached to service successfully' },
					})
				);
			} else resolve({ status: 404, data: { msg: 'Service not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:networkAttach_orchestrator', process: processData });
};

module.exports = method;
