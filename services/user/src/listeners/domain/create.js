const { create } = require('../../helpers/domain');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId: name }) =>
	new Promise((resolve) => {
		create({ name, domain: 'optimuscp.io' })
			.then((data) => resolve({ status: 200, data }))
			.catch((err) => resolve({ status: 500 }));
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_domain:create_orchestrator', process: processData });
};

module.exports = method;
