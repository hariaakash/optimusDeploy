const { ObjectId } = require('mongoose').Types;

const Volume = require('../../schemas/volume');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, projectId, easyId }) =>
	new Promise((resolve) => {
		const volume = new Volume({ _id: ObjectId(), name, easyId, project: projectId });
		volume.save().then(() => resolve({ status: 200, data: { volumeId: volume._id } }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_volume:create_orchestrator', process: processData });
};

module.exports = method;
