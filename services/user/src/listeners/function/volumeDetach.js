const Functions = require('../../schemas/function');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId, volumeId }) =>
	new Promise((resolve) => {
		Functions.findOne({ easyId, project: projectId }).then((aFunction) => {
			if (aFunction) {
				aFunction.volumes = aFunction.volumes.filter((x) => String(x) !== volumeId);
				aFunction.save().then(() =>
					resolve({
						status: 200,
						data: { msg: 'Volume detached from function successfully' },
					})
				);
			} else resolve({ status: 404, data: { msg: 'Function not found.' } });
		});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_function:volumeDetach_orchestrator', process: processData });
};

module.exports = method;
