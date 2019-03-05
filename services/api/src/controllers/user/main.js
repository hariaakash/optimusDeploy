const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	authKey: Joi.string()
		.length(21)
		.required(),
});

const request = (req, res) => {
	schema
		.validate({ authKey: req.headers.authkey }, { abortEarly: false })
		.then((vData) => {
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:main_api',
				data: vData,
			}).then(({ status, data }) => res.status(status).json(data));
		})
		.catch((vError) => {
			res.status(400).json({
				status: false,
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			});
		});
};

module.exports = request;