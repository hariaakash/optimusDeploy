const apm = require('elastic-apm-node');
const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	authKey: Joi.string()
		.length(21)
		.required(),
	projectEasyId: Joi.string()
		.regex(/^(?:[a-z0-9]+[-]?)+$/)
		.min(6)
		.max(30)
		.required(),
});

const request = (req, res) => {
	const validationSpan = apm.startSpan('Data Validation');
	schema
		.validate({ ...req.query, authKey: req.headers.authkey }, { abortEarly: false })
		.then((vData) => {
			if (validationSpan) {
				validationSpan.end();
			}
			const mainProjectSpan = apm.startSpan('AMQP Call: orchestrator_project:main_api');
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_project:main_api',
				data: vData,
			}).then(({ status, data }) => {
				if (mainProjectSpan) {
					mainProjectSpan.end();
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
