const { ObjectId } = require('mongoose').Types;

const Network = require('../../schemas/network');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, projectId, easyId }) =>
	new Promise((resolve) => {
		const network = new Network({ _id: ObjectId(), name, easyId, project: projectId });
		network.save().then(() => resolve({ status: 200, data: { networkId: network._id } }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_network:create_orchestrator', process: processData });
};

module.exports = method;
