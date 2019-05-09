const { rpcConsume } = require('../../helpers/amqp-wrapper');

const { Google, handle } = require('../../helpers/social');

const process = ({ code }) =>
	new Promise((resolve) => {
		Google.auth({ code })
			.then((data) => handle(data, 'google'))
			.then(({ authKey }) =>
				resolve({
					status: 200,
					data: { authKey, msg: 'Successfully authenticated using google.' },
				})
			)
			.catch((err) => {
				if (err.response)
					resolve({ status: 401, data: { msg: 'Google authentication failed.' } });
				else resolve({ status: 500 });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:authGoogle_orchestrator', process });
};

module.exports = method;
