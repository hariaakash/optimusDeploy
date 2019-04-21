const { create } = require('../../helpers/service');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({
	projectEasyId,
	name,
	enablePublic,
	domain,
	image,
	projectId,
	functionId,
	networks,
}) =>
	new Promise((resolve, reject) => {
		const Image = ['node', 'python'].includes(image) ? `hariaakash/faas-${image}` : null;
		if (enablePublic) networks.push('proxy');
		create({
			aFunction: true,
			Name: name,
			Labels: {
				'traefik.enable': `${enablePublic}`,
				'traefik.frontend.rule': `Host:${domain}`,
				'traefik.port': '3000',
			},
			Env: [`PROJECT_EASY_ID=${projectEasyId}`],
			Image,
			projectId,
			volumeId: functionId,
			Networks: networks.map((Target) => ({ Target })),
			next: (err, data) => {
				if (!err) resolve(true);
				else if (err.statusCode === 400) resolve(true);
				else reject();
			},
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_function:create_orchestrator' });
	consume({ ch, queue: 'container_function:create_orchestrator', process: processData });
};

module.exports = method;
