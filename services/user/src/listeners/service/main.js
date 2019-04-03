const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

let select = [
	'name',
	'easyId',
	'networks',
	'info.domain',
	'info.enablePublic',
	'info.port',
	'info.repo',
	'info.image.name',
];
select = select.join(' ');

const processData = ({ projectId, easyId }) =>
	new Promise((resolve) => {
		Service.findOne({ easyId, project: projectId })
			.populate('networks', 'name easyId')
			.select(select)
			.then((service) => {
				if (service)
					resolve({
						status: 200,
						data: service,
					});
				else resolve({ status: 404, data: { msg: 'Service not found.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:main_orchestrator', process: processData });
};

module.exports = method;
