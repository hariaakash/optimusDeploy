const async = require('async');

const { remove } = require('../../helpers/service');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ names }) =>
	new Promise((resolve, reject) => {
		async.each(
			names,
			(service, cb) => {
				remove({
					name: service,
					next: (err, data) => {
						if (!err) cb();
						else if (err.statusCode === 404) cb();
						else cb(err);
					},
				});
			},
			(err) => {
				if (err) reject();
				else resolve(true);
			}
		);
	});

const method = (ch) => {
	assert({ ch, queue: 'container_service:remove_orchestrator' });
	consume({ ch, queue: 'container_service:remove_orchestrator', process: processData });
};

module.exports = method;
