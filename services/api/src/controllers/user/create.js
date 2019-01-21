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
		.then((vUser) => {
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:create_api',
				data: vUser,
			}).then(({ status, data }) => res.status(status).json(data));
		})
		.catch((vError) => {
			const data = vError.details.map((d) => d.message);
			res.status(400).json({
				status: false,
				msg: 'Validation Error',
				data,
			});
		});
};

module.exports = request;
