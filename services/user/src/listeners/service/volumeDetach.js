const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId, volumeId }) =>
	new Promise((resolve) => {
		Service.findOne({ easyId, project: projectId }).then((service) => {
			if (service) {
				service.volumes = service.volumes.filter((x) => String(x) !== volumeId);
				service.save().then(() =>
					resolve({
						status: 200,
						data: { msg: 'Volume detached from service successfully' },
					})
				);
			} else resolve({ status: 404, data: { msg: 'Service not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:volumeDetach_orchestrator', process: processData });
};

module.exports = method;
