const apm = require('elastic-apm-node');
const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	authKey: Joi.string()
		.length(21)
		.required(),
});

const request = (req, res) => {
	const validateSpan = apm.startSpan('Data Validation');
	schema
		.validate({ authKey: req.headers.authkey }, { abortEarly: false })
		.then((vData) => {
			if (validateSpan) {
				validateSpan.end();
			}
			const amqpSpan = apm.startSpan('AMQP Call: orchestrator_user:main_api');
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:main_api',
				data: vData,
			}).then(({ status, data }) => {
				if (amqpSpan) {
					amqpSpan.end();
				}
				res.status(status).json(data);
			});
		})
		.catch((vError) => {
			res.status(400).json({
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			});
			if (validateSpan) {
				validateSpan.end();
			}
		});
};

module.exports = request;
