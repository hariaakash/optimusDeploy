const Functions = require('../../schemas/function');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId, networkId }) =>
	new Promise((resolve) => {
		Functions.findOne({ easyId, project: projectId }).then((aFunction) => {
			if (aFunction) {
				aFunction.networks = aFunction.networks.filter((x) => String(x) !== networkId);
				aFunction.save().then(() =>
					resolve({
						status: 200,
						data: { msg: 'Network detached from function successfully' },
					})
				);
			} else resolve({ status: 404, data: { msg: 'Function not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_function:networkDetach_orchestrator', process: processData });
};

module.exports = method;
