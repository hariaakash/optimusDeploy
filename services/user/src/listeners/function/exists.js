const Functions = require('../../schemas/function');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, easyId }) =>
	new Promise((resolve) => {
		const options = { easyId };
		if (projectId) options.project = projectId;
		Functions.findOne(options).then((aFunction) => {
			if (aFunction)
				resolve({
					status: 200,
					data: {
						aFunctionId: aFunction._id,
						msg: 'Function with easyId already exists.',
					},
				});
			else resolve({ status: 404, data: { msg: 'Function not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_function:exists_orchestrator', process: processData });
};

module.exports = method;
