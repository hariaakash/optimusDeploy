// ///////////////////////////////////////
// Add the authKey validation helper
// //////////////////////////////////////

const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const process = ({ email, authKey, containerName, projectId, stack }, ch) =>
	new Promise(
		(resolve) => {
			resolve();
		}
		// final creation method on queue: container_manager:createContainer_orchestrator
	);

const method = (ch) => {
	rpcConsume({
		ch,
		queue: 'orchestrator_container:createContainer_api',
		process,
	});
};

module.exports = method;
