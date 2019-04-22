const Functions = require('../../schemas/function');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, networkId }) =>
	new Promise((resolve) => {
		Functions.find({ project: projectId, networks: networkId })
			.select('name easyId')
			.then((functions) => {
				if (functions.length > 0)
					resolve({
						status: 200,
						data: {
							functions,
							msg: 'Network is already attached to one or more functions.',
						},
					});
				else resolve({ status: 404, data: { msg: 'Network not attached.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_function:networkUsage_orchestrator', process: processData });
};

module.exports = method;
