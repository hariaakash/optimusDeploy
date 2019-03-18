const async = require('async');

const { remove } = require('../../helpers/network');
const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ name }) =>
	new Promise((resolve, reject) => {
		async.each(
			name,
			(network, cb) => {
				remove({
					name: network,
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
	assert({ ch, queue: 'container_network:remove_orchestrator' });
	consume({ ch, queue: 'container_network:remove_orchestrator', process: processData });
};

module.exports = method;
