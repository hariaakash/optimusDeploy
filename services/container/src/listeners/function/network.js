const { update } = require('../../helpers/service');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, networks, enablePublic }) =>
	new Promise((resolve, reject) => {
		if (enablePublic) networks.push('proxy');
		update({
			name,
			type: 'network',
			data: { Networks: networks.map((Target) => ({ Target })) },
			next: (err, res) => {
				if (!err) resolve(true);
				else if (err.statusCode === 404) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_function:network_orchestrator' });
	consume({ ch, queue: 'container_function:network_orchestrator', process: processData });
};

module.exports = method;
