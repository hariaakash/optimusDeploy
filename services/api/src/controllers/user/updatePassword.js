const apm = require('elastic-apm-node');
const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	email: Joi.string()
		.email({ minDomainAtoms: 2 })
		.required(),
	pToken: Joi.string()
		.length(21)
		.required(),
	newPassword: Joi.string()
		.min(8)
		.max(64)
		.required(),
});

const request = (req, res) => {
	const validateSpan = apm.startSpan('Data Validation');
	schema
		.validate(req.body, { abortEarly: false })
		.then((vData) => {
			if (validateSpan) {
				validateSpan.end();
			}
			const amqpSpan = apm.startSpan('AMQP Call: orchestrator_user:updatePassword_api');
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:updatePassword_api',
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
