const Network = require('../../schemas/network');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, networkId }) =>
	new Promise((resolve) => {
		if (projectId)
			Network.find({ project: projectId }).then((networks) => {
				networks.forEach((x) => x.remove());
				resolve(true);
			});
		else
			Network.findOne({ _id: networkId }).then((network) => {
				if (network) network.remove();
				resolve(true);
			});
	});

const method = (ch) => {
	assert({ ch, queue: 'user_network:remove_orchestrator' });
	consume({ ch, queue: 'user_network:remove_orchestrator', process: processData });
};

module.exports = method;
