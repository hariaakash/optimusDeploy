const { find, remove } = require('../../helpers/network');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const removeNetwork = ({ id, resolve, reject }) =>
	remove({
		id,
		next: (err, data) => {
			if (!err) resolve(true);
			else if (err.statusCode === 409) resolve(true);
			else reject();
		},
	});

const processData = ({ id = false, name }) =>
	new Promise((resolve, reject) => {
		if (id) removeNetwork({ id: name, resolve, reject });
		else
			find({
				name,
				next: (err, data) => {
					if (!err) removeNetwork({ id: data.Id, resolve, reject });
					else if (err.statusCode === 404) resolve(true);
					else reject();
				},
			});
	});

const method = (ch) => {
	assert({ ch, queue: 'container_network:remove_orchestrator' });
	consume({ ch, queue: 'container_network:remove_orchestrator', process: processData });
};

module.exports = method;
