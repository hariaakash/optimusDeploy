const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	serviceId: Joi.string()
		.length(24)
		.required(),
});

const request = (req, res) => {
	schema
		.validate({ ...req.body, ...req.params }, { allowUnknown: true })
		.then((vData) => {
			rpcSend({ ch: req.ch, queue: 'orchestrator_user:hookGithub_api', data: vData }).then(
				({ status, data }) => res.status(status).json(data)
			);
		})
		.catch((vError) => {
			res.status(400).json({
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			});
		});
};

module.exports = request;
