const { update } = require('../../helpers/service');
const { assert, consume } = require('../../helpers/amqp-wrapper');

// update({ name: 'qq', type: 'scaleup', next: (err, data) => console.log(err || data) });
// update({
// 	name: 'qq',
// 	type: 'network',
// 	data: { Networks: [{ Target: 'qq1' }] },
// 	next: (err, data) => console.log(err || data),
// });
// update({
// 	name: 'qq',
// 	type: 'enablePublic',
// 	data: { enablePublic: true },
// 	next: (err, data) => console.log(err || data),
// });
// update({
// 	name: 'qq',
// 	type: 'domain',
// 	data: { domain: 'www.api.local,api.local' },
// 	next: (err, data) => console.log(err || data),
// });
// update({
// 	name: 'qq',
// 	type: 'port',
// 	data: { port: '5000' },
// 	next: (err, data) => console.log(err || data),
// });
// update({
// 	name: 'qq',
// 	type: 'start',
// 	next: (err, data) => console.log(err || data),
// });

const processData = ({ name, type, data }) =>
	new Promise((resolve, reject) => {
		let operate = true;
		const processedData = {};
		if (type === 'network' && Object.prototype.hasOwnProperty.call(data, 'networks'))
			processedData.Networks = data.networks.map((Target) => ({ Target }));
		else if (type === 'port' && Object.prototype.hasOwnProperty.call(data, 'port'))
			processedData.port = data.port;
		else if (type === 'domain' && Object.prototype.hasOwnProperty.call(data, 'domain'))
			processedData.domain = data.domain;
		else if (type === 'domain' && Object.prototype.hasOwnProperty.call(data, 'enablePublic'))
			processedData.enablePublic = data.enablePublic;
		else operate = false;
		if (operate)
			update({
				name,
				type,
				data: processedData,
				next: (err, res) => {
					if (!err) resolve(true);
					else if (err.statusCode === 404) resolve(true);
					else reject();
				},
			});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_service:update_orchestrator' });
	consume({ ch, queue: 'container_service:update_orchestrator', process: processData });
};

module.exports = method;
