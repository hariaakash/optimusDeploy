const { remove } = require('../../helpers/volume');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId }) =>
	new Promise((resolve, reject) =>
		remove({
			projectId,
			next: (err, data) => {
				if (err) reject();
				else resolve(true);
			},
		})
	);

const method = (ch) => {
	assert({ ch, queue: 'container_volume:projectRemove_orchestrator' });
	consume({ ch, queue: 'container_volume:projectRemove_orchestrator', process: processData });
};

module.exports = method;
