const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, volumeId }) =>
	new Promise((resolve) => {
		Service.find({ project: projectId, volumes: volumeId })
			.select('name easyId')
			.then((services) => {
				if (services.length > 0)
					resolve({
						status: 200,
						data: {
							services,
							msg: 'Volume is already attached to one or more services.',
						},
					});
				else resolve({ status: 404, data: { msg: 'Volume not attached.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:volumeUsage_orchestrator', process: processData });
};

module.exports = method;
