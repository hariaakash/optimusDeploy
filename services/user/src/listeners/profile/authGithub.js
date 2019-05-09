const { rpcConsume } = require('../../helpers/amqp-wrapper');

const { Github, handle } = require('../../helpers/social');

const process = ({ code }) =>
	new Promise((resolve) => {
		Github.auth({ code })
			.then((data) => handle(data, 'github'))
			.then(({ authKey }) =>
				resolve({
					status: 200,
					data: { authKey, msg: 'Successfully authenticated using github.' },
				})
			)
			.catch((err) => {
				if (err.response)
					resolve({ status: 401, data: { msg: 'Github authentication failed.' } });
				else resolve({ status: 500 });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:authGithub_orchestrator', process });
};

module.exports = method;
