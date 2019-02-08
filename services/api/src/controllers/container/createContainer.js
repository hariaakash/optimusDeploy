const Joi = require('joi');

const { assert, rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	email: Joi.string()
		.email()
		.required(),
	authKey: Joi.string().required(),
	containerName: Joi.string().required(),
	projectId: Joi.string(), // add length to this also after confirmation
	stack: Joi.string()
		.valid(['mean'], ['python-flask'], ['python-django']) // I suggest adding these to separate module for easier changes
		.required(),
	// additional threshold to be added
});

const request = (req, res) => {
	schema
		.validate(req.body, { abortEarly: false })
		.then((vData) => {
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_container:createContainer_api',
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
