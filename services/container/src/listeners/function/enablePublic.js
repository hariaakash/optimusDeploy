const { update } = require('../../helpers/service');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, enablePublic }) =>
	new Promise((resolve, reject) => {
		update({
			name,
			type: 'enablePublic',
			data: { enablePublic },
			next: (err, res) => {
				if (!err) resolve(true);
				else if (err.statusCode === 404) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_function:enablePublic_orchestrator' });
	consume({ ch, queue: 'container_function:enablePublic_orchestrator', process: processData });
};

module.exports = method;
