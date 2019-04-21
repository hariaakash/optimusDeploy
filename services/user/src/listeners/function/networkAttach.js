const Functions = require('../../schemas/function');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId, networkId }) =>
	new Promise((resolve) => {
		Functions.findOne({ easyId, project: projectId }).then((aFunction) => {
			if (aFunction) {
				aFunction.networks.push(networkId);
				aFunction.save().then(() =>
					resolve({
						status: 200,
						data: { msg: 'Network attached to function successfully' },
					})
				);
			} else resolve({ status: 404, data: { msg: 'Function not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_function:networkAttach_orchestrator', process: processData });
};

module.exports = method;
