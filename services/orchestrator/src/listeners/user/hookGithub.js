const async = require('async');

const { send, assert, consume, rpcSend } = require('../../helpers/amqp-wrapper');

const processData = ({ ref, repository: { full_name: repo } }, ch) =>
	new Promise((resolve, reject) => {
		const branch = ref.split('/')[2];
		// console.log(branch);
		// console.log(repo);
		resolve();
	});

const method = (ch) => {
	assert({ ch, queue: 'orchestrator_user:hookGithub_api' });
	consume({ ch, queue: 'orchestrator_user:hookGithub_api', process: processData });
};

module.exports = method;
