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
			.catch((err) =>
				resolve(
					err.response.status === 401
						? { status: 401, data: { msg: 'Github authentication failed.' } }
						: { status: 500 }
				)
			);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:authGithub_orchestrator', process });
};

module.exports = method;
