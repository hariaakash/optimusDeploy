const Functions = require('../../schemas/function');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, enablePublic }) =>
	new Promise(async (resolve) => {
		Functions.findOne({ easyId }).then((aFunction) => {
			if (aFunction) {
				aFunction.info.enablePublic = enablePublic;
				aFunction.save().then(() => resolve(true));
			} else resolve(true);
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'user_function:enablePublic_orchestrator' });
	consume({ ch, queue: 'user_function:enablePublic_orchestrator', process: processData });
};

module.exports = method;
