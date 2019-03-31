const { create } = require('../../helpers/service');

const { assert, consume } = require('../../helpers/amqp-wrapper');

// create({
// 	Name: 'qq',
// 	Labels: {
// 		'traefik.enable': 'true',
// 		'traefik.frontend.rule': `Host:${'www.api.local,api.local'}`,
// 		'traefik.port': '3000',
// 	},
// 	Image: 'hariaakash/op-node:latest',
// 	projectId: 'qq',
// 	serviceId: 'qq',
// 	Networks: [{ Target: 'qq1' }],
// 	// Networks: [{ Target: 'qq1' }, { Target: 'proxy' }],
// 	next: (err, data) => {
// 		if (err) console.log(err);
// 		else console.log(data);
// 	},
// });

const processData = ({ name, enablePublic, domain, port, image, projectId, serviceId, networks }) =>
	new Promise((resolve, reject) => {
		const Image = ['node', 'php7', 'static', 'flask'].includes(image)
			? `hariaakash/op-${image}`
			: null;
		if (enablePublic) networks.push('proxy');
		create({
			Name: name,
			Labels: {
				'traefik.enable': `${enablePublic}`,
				'traefik.frontend.rule': `Host:${domain}`,
				'traefik.port': `${port}`,
			},
			Image,
			projectId,
			serviceId,
			Networks: networks.map((Target) => ({ Target })),
			next: (err, data) => {
				if (!err) resolve(true);
				else if (err.statusCode === 400) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_service:create_orchestrator' });
	consume({ ch, queue: 'container_service:create_orchestrator', process: processData });
};

module.exports = method;
