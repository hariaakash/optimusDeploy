const Functions = require('../../schemas/function');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, functionId }) =>
	new Promise((resolve) => {
		if (projectId)
			Functions.find({ project: projectId }).then((functions) => {
				functions.forEach((x) => x.remove());
				resolve(true);
			});
		else
			Functions.findOne({ _id: functionId }).then((aFunction) => {
				if (aFunction) aFunction.remove();
				else resolve(true);
			});
	});

const method = (ch) => {
	assert({ ch, queue: 'user_function:remove_orchestrator' });
	consume({ ch, queue: 'user_function:remove_orchestrator', process: processData });
};

module.exports = method;
