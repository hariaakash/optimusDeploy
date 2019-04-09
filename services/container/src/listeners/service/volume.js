const { update } = require('../../helpers/service');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, volumes }) =>
	new Promise((resolve, reject) => {
		update({
			name,
			type: 'volume',
			data: {
				Mounts: volumes.map(({ Source, Target }) => ({ Type: 'bind', Source, Target })),
			},
			next: (err, res) => {
				if (!err) resolve(true);
				else if (err.statusCode === 404) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_service:volume_orchestrator' });
	consume({ ch, queue: 'container_service:volume_orchestrator', process: processData });
};

module.exports = method;
