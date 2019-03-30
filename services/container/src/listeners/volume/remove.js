const { remove } = require('../../helpers/volume');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, volumeId }) =>
	new Promise((resolve, reject) =>
		remove({
			volumeId,
			projectId,
			next: (err, data) => {
				if (err) reject();
				else resolve(true);
			},
		})
	);

const method = (ch) => {
	assert({ ch, queue: 'container_volume:remove_orchestrator' });
	consume({ ch, queue: 'container_volume:remove_orchestrator', process: processData });
};

module.exports = method;
