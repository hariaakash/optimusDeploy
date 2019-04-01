const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, networkId }) =>
	new Promise((resolve) => {
		Service.find({ project: projectId, networks: networkId })
			.select('name easyId')
			.then((services) => {
				if (services.length > 0)
					resolve({
						status: 200,
						data: {
							services,
							msg: 'Network is already attached.',
						},
					});
				else resolve({ status: 404, data: { msg: 'Network not attached.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:networkUsage_orchestrator', process: processData });
};

module.exports = method;
