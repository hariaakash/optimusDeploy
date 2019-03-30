const apm = require('elastic-apm-node');
const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	authKey: Joi.string()
		.length(21)
		.required(),
	name: Joi.string()
		.regex(/^[0-9a-zA-Z\-'" !]+$/)
		.min(4)
		.max(30)
		.required(),
	easyId: Joi.string()
		.regex(/^(?:[A-Za-z0-9]+[-]?)+$/)
		.min(6)
		.max(30)
		.required(),
});

const request = (req, res) => {
	const validationSpan = apm.startSpan('Data Validation');
	schema
		.validate({ ...req.body, authKey: req.headers.authkey }, { abortEarly: false })
		.then((vData) => {
			if (validationSpan) {
				validationSpan.end();
			}
			const createProSpan = apm.startSpan('AMQP Call: orchestrator_project:create_api');
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_project:create_api',
				data: vData,
			}).then(({ status, data }) => {
				if (createProSpan) {
					createProSpan.end();
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
