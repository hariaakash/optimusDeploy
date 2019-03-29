const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, easyId }) =>
	new Promise((resolve) => {
		const options = { easyId };
		if (projectId) options.project = projectId;
		Service.findOne(options).then((service) => {
			if (service)
				resolve({
					status: 200,
					data: {
						serviceId: service._id,
						msg: 'Service with easyId already exists.',
					},
				});
			else resolve({ status: 404, data: { msg: 'Service not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:exists_orchestrator', process: processData });
};

module.exports = method;
