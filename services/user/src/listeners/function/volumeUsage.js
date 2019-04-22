const Functions = require('../../schemas/function');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, volumeId }) =>
	new Promise((resolve) => {
		Functions.find({ project: projectId, volumes: volumeId })
			.select('name easyId')
			.then((functions) => {
				if (functions.length > 0)
					resolve({
						status: 200,
						data: {
							functions,
							msg: 'Volume is already attached to one or more functions.',
						},
					});
				else resolve({ status: 404, data: { msg: 'Volume not attached.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_function:volumeUsage_orchestrator', process: processData });
};

module.exports = method;
