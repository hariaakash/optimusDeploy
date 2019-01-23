const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	email: Joi.string()
		.email({ minDomainAtoms: 2 })
		.required(),
	pToken: Joi.string()
		.length(21)
		.required(),
	newPwd: Joi.string()
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
				queue: 'orchestrator_user:updatePassword_api',
				data: vData,
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
