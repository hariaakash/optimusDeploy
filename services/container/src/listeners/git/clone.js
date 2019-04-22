const { clone: githubClone, publicClone: githubPublicClone } = require('../../helpers/github');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({
	aFunction = false,
	image,
	projectId,
	volumeId,
	accessToken,
	repo,
	branch,
	source,
}) =>
	new Promise((resolve, reject) => {
		if (aFunction) {
			githubPublicClone({ projectId, volumeId, image })
				.then(() => resolve(true))
				.catch((err) => {
					console.log(err);
					if (err.includes('already exists')) resolve(true);
					else reject();
				});
		} else if (source === 'github')
			githubClone({ projectId, volumeId, accessToken, repo, branch })
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
