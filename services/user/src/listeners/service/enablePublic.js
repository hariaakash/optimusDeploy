const Service = require('../../schemas/service');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, enablePublic }) =>
	new Promise(async (resolve) => {
		Service.findOne({ easyId }).then((service) => {
			if (service) {
				service.info.enablePublic = enablePublic;
				service.save().then(() => resolve(true));
			} else resolve(true);
		});
	});

const method = (ch) => {
	assert({ ch, queue: 'user_service:enablePublic_orchestrator' });
	consume({ ch, queue: 'user_service:enablePublic_orchestrator', process: processData });
};

module.exports = method;
