const apm = require('elastic-apm-node');
const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	code: Joi.string().required(),
});

const request = (req, res) => {
	const validationSpan = apm.startSpan('Data Validation');
	schema
		.validate(req.body, { abortEarly: false })
		.then((vData) => {
			if (validationSpan) {
				validationSpan.end();
			}
			const googleAuthSpan = apm.startSpan('AMQP Call: orchestrator_user:auth_api');
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:auth_api',
				data: { ...vData, authType: 'google' },
			}).then(({ status, data }) => {
				if (googleAuthSpan) {
					googleAuthSpan.end();
				}
				res.status(status).json(data);
			});
		})
		.catch((vError) => {
			res.status(400).json({
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			});
			if (validationSpan) {
				validationSpan.end();
			}
		});
};

module.exports = request;
