const { create } = require('../../helpers/volume');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, volumeId }) =>
	new Promise((resolve, reject) => {
		create({
			projectId,
			volumeId,
			next: (err, data) => {
				if (!err) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_volume:create_orchestrator' });
	consume({ ch, queue: 'container_volume:create_orchestrator', process: processData });
};

module.exports = method;
