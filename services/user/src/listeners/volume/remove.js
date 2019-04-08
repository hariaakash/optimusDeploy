const Volume = require('../../schemas/volume');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, volumeId }) =>
	new Promise((resolve) => {
		if (projectId)
			Volume.find({ project: projectId }).then((volumes) => {
				volumes.forEach((x) => x.remove());
				resolve(true);
			});
		else
			Volume.findOne({ _id: volumeId }).then((volume) => {
				if (volume) volume.remove();
				resolve(true);
			});
	});

const method = (ch) => {
	assert({ ch, queue: 'user_volume:remove_orchestrator' });
	consume({ ch, queue: 'user_volume:remove_orchestrator', process: processData });
};

module.exports = method;
