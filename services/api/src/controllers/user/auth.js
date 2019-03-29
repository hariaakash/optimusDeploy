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
});

const request = (req, res) => {
	schema
		.validate(req.body, { abortEarly: false })
		.then((vData) => {
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:auth_api',
				data: { ...vData, authType: 'email' },
			}).then(({ status, data }) => res.status(status).json(data));
		})
		.catch((vError) =>
			res.status(400).json({
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			})
		);
};

module.exports = request;
