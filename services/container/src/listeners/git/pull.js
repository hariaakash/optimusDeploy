const githubPull = require('../../helpers/github').pull;

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, serviceId, accessToken, repo, branch, source }) =>
	new Promise((resolve, reject) => {
		if (source === 'github')
			githubPull({ projectId, serviceId, accessToken, repo, branch })
				.then(() => resolve(true))
				.catch((err) => {
					console.log(err);
					resolve(true);
				});
		else resolve(true);
	});

const method = (ch) => {
	assert({ ch, queue: 'container_git:pull_orchestrator' });
	consume({ ch, queue: 'container_git:pull_orchestrator', process: processData });
};

module.exports = method;
