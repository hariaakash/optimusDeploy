const { remove } = require('../../helpers/domain');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ domain, domainIds }) =>
	new Promise((resolve) => {
		remove({ domain, domainIds })
			.then((data) => resolve(true))
			.catch((err) => resolve());
	});

const method = (ch) => {
	assert({ ch, queue: 'user_domain:remove_orchestrator' });
	consume({ ch, queue: 'user_domain:remove_orchestrator', process: processData });
};

module.exports = method;
