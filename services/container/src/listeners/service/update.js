const { update } = require('../../helpers/service');
const { assert, consume } = require('../../helpers/amqp-wrapper');

// update({ name: 'qq', type: 'scaleup', next: (err, data) => console.log(err || data) });
// update({
// 	name: 'qq',
// 	type: 'network',
// 	data: { Networks: [{ Target: 'qq1' }] },
// 	next: (err, data) => console.log(err || data),
// });

const processData = ({ name, type, networks }) =>
	new Promise((resolve, reject) => {
		const data = {};
		data.Networks = type === 'network' ? networks.map((Target) => ({ Target })) : [];
		update({
			name,
			type,
			data,
			next: (err, res) => {
				if (!err) resolve(true);
				else if (err.statusCode === 404) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_service:remove_orchestrator' });
	consume({ ch, queue: 'container_service:remove_orchestrator', process: processData });
};

module.exports = method;
