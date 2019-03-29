const Joi = require('joi');

const { send } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({ ref: Joi.string().required() });

const request = (req, res) => {
	schema
		.validate({ ...req.body }, { allowUnknown: true })
		.then((vData) => {
			send({ ch: req.ch, queue: 'orchestrator_user:hookGithub_api', data: vData });
			res.json({});
		})
		.catch((vError) => {
			res.status(400).json({
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			});
		});
};

module.exports = request;
