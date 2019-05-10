const apm = require('elastic-apm-node');
const Joi = require('joi');

const { rpcSend } = require('../../helpers/amqp-wrapper');

const schema = Joi.object().keys({
	authKey: Joi.string()
		.length(21)
		.required(),
	source: Joi.string()
		.valid(['github', ''])
		.required(),
});

const request = (req, res) => {
	const validationSpan = apm.startSpan('Data Validation');
	schema
		.validate({ authKey: req.headers.authkey, ...req.query }, { abortEarly: false })
		.then((vData) => {
			if (validationSpan) {
				validationSpan.end();
			}
			const fetchRepoSpan = apm.startSpan('AMQP Call: orchestrator_user:repos_api');
			rpcSend({
				ch: req.ch,
				queue: 'orchestrator_user:repos_api',
				data: vData,
			}).then(({ status, data }) => {
				if (fetchRepoSpan) {
					fetchRepoSpan.end();
				}
				res.status(status).json(data);
			});
		})
		.catch((vError) => {
			res.status(400).json({
				msg: 'Validation Error',
				data: vError.details.map((d) => d.message),
			});
			if (validationSpan) {
				validationSpan.end();
			}
		});
};

module.exports = request;
