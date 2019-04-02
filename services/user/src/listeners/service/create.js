const { ObjectId } = require('mongoose').Types;

const Service = require('../../schemas/service');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, easyId, projectId, networks, repo, image, enablePublic, port }) =>
	new Promise((resolve) => {
		const service = new Service({
			_id: ObjectId(),
			name,
			easyId,
			project: projectId,
			networks,
			info: {
				port,
				image: { name: image },
				repo: { source: repo.source, name: repo.name, branch: repo.branch },
				enablePublic,
			},
		});
		service.save().then(() => resolve({ status: 200, data: { serviceId: service._id } }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_service:create_orchestrator', process: processData });
};

module.exports = method;
