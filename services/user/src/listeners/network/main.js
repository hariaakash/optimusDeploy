const Network = require('../../schemas/network');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId }) =>
	new Promise((resolve) => {
		Network.findOne({ easyId, project: projectId })
			.select('name easyId')
			.then((network) => {
				if (network)
					resolve({
						status: 200,
						data: network,
					});
				else resolve({ status: 404, data: { msg: 'Network not found.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_network:main_orchestrator', process: processData });
};

module.exports = method;
