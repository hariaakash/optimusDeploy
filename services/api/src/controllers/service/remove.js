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
	serviceEasyId: Joi.string()
		.regex(/^(?:[a-z0-9]+[-]?)+$/)
		.min(6)
		.max(30)
		.required(),
});

const request = (req, res) => {
	schema
		.validate({ ...req.body, authKey: req.headers.authkey }, { abortEarly: false })
		.then((vData) => {
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_service:remove_api',
				data: vData,
			}).then(({ status, data }) => res.status(status).json(data));
		})
		.catch((vError) => {
			res.status(400).json({
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			});
		});
};

module.exports = request;
