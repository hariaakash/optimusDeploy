const Volume = require('../../schemas/volume');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ easyId, projectId }) =>
	new Promise((resolve) => {
		Volume.findOne({ easyId, project: projectId })
			.select('name easyId')
			.then((volume) => {
				if (volume)
					resolve({
						status: 200,
						data: volume,
					});
				else resolve({ status: 404, data: { msg: 'Volume not found.' } });
			});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_volume:main_orchestrator', process: processData });
};

module.exports = method;
