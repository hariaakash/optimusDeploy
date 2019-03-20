const { repos } = require('../../helpers/social').Github;
const { rpcConsume, rpcSend } = require('../../helpers/amqp-wrapper');

const processData = ({ accessToken }) =>
	new Promise((resolve) => {
		repos({ accessToken })
			.then((data) => resolve({ status: 200, data }))
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_project:repos_orchestrator', process: processData });
};

module.exports = method;
