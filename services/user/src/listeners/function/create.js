const { ObjectId } = require('mongoose').Types;

const Functions = require('../../schemas/function');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ name, easyId, projectId, networks, image, enablePublic }) =>
	new Promise((resolve) => {
		const newfunction = new Functions({
			_id: ObjectId(),
			name,
			easyId,
			project: projectId,
			networks,
			info: { image: { name: image }, enablePublic },
		});
		newfunction
			.save()
			.then(() => resolve({ status: 200, data: { functionId: newfunction._id } }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_function:create_orchestrator', process: processData });
};

module.exports = method;
