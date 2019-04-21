const { update } = require('../../helpers/service');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ name }) =>
	new Promise((resolve, reject) => {
		update({
			name,
			type: 'restart',
			next: (err, res) => {
				if (!err) resolve(true);
				else if (err.statusCode === 404) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_function:restart_orchestrator' });
	consume({ ch, queue: 'container_function:restart_orchestrator', process: processData });
};

module.exports = method;
