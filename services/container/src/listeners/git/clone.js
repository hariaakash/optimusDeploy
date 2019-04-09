const githubClone = require('../../helpers/github').clone;

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, serviceId, accessToken, repo, branch, source }) =>
	new Promise((resolve, reject) => {
		if (source === 'github')
			githubClone({ projectId, serviceId, accessToken, repo, branch })
				.then(() => resolve(true))
				.catch((err) => {
					console.log(err);
					if (err.includes('already exists')) resolve(true);
					else reject();
				});
		else resolve(true);
	});

const method = (ch) => {
	assert({ ch, queue: 'container_git:clone_orchestrator' });
	consume({ ch, queue: 'container_git:clone_orchestrator', process: processData });
};

module.exports = method;
