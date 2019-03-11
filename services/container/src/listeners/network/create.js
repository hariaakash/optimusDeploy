const { create } = require('../../helpers/network');

const { assert, consume, send } = require('../../helpers/amqp-wrapper');

const processData = ({ name }) =>
	new Promise((resolve, reject) => {
		create({
			name,
			next: (err, data) => {
				if (!err) resolve(true);
				else if (err.statusCode === 409) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_network:create_orchestrator' });
	consume({ ch, queue: 'container_network:create_orchestrator', process: processData });
};

module.exports = method;
