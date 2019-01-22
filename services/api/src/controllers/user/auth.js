const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	email: Joi.string()
		.email({ minDomainAtoms: 2 })
		.required(),
	password: Joi.string()
		.min(8)
		.max(64)
		.required(),
	authType: Joi.string()
		.valid(['email', 'google', 'github'])
		.required(),
});

const request = (req, res) => {
	schema
		.validate(req.body, { abortEarly: true })
		.then((vData) => {
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:auth_api',
				data: vData,
			}).then(({ status, data }) => res.status(status).json(data));
		})
		.catch((vError) =>
			res.status(400).json({
				status: false,
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			})
		);
};

module.exports = request;
