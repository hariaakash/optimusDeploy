const Network = require('../../schemas/network');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId }) =>
	new Promise((resolve) => {
		Network.findOne({ easyId, project: projectId }).then((network) => {
			if (network)
				resolve({
					status: 200,
					data: { networkId: network._id, msg: 'Network with easyId already exists.' },
				});
			else resolve({ status: 404, data: { msg: 'Network not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_network:exists_orchestrator', process: processData });
};

module.exports = method;
