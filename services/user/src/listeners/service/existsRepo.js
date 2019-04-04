const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ serviceId, repo, branch }) =>
	new Promise((resolve) => {
		Service.findOne({ _id: serviceId, 'info.repo.name': repo, 'info.repo.branch': branch })
			.select('name easyId project info.repo')
			.then((service) =>
				service
					? resolve({ status: 200, data: service })
					: resolve({ status: 404, data: { msg: 'Service not found.' } })
			);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:existsRepo_orchestrator', process: processData });
};

module.exports = method;
