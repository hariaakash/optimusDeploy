const githubClone = require('../../helpers/github').clone;

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ projectId, serviceId, accessToken, repo, branch, source }) =>
	new Promise((resolve) => {
		if (source === 'github')
			githubClone({ projectId, serviceId, accessToken, repo, branch })
				.then(() =>
					resolve({
						status: 200,
						data: { msg: 'Successfully cloned.' },
					})
				)
				.catch((err) => resolve({ status: 500, data: { msg: err.msg } }));
		else resolve({ status: 404, data: { msg: 'Invalid source.' } });
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'container_git:clone_orchestrator', process: processData });
};

module.exports = method;
