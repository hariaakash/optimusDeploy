const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	code: Joi.string()
		.length(20)
		.required(),
});

const request = (req, res) => {
	schema
		.validate(req.body, { abortEarly: false })
		.then((vData) => {
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:auth_api',
				data: { ...vData, authType: 'github' },
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
