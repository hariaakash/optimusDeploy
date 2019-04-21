const Functions = require('../../schemas/function');

const { rpcConsume } = require('../../helpers/amqp-wrapper');

let select = [
	'name',
	'easyId',
	'networks',
	'volumes',
	'info.domain',
	'info.enablePublic',
	'info.image.name',
];
select = select.join(' ');

const processData = ({ projectId, easyId, all = false }) =>
	new Promise((resolve) => {
		if (all)
			Functions.find({ project: projectId })
				.select(select)
				.then((functions) => resolve({ status: 200, data: functions }));
		else
			Functions.findOne({ easyId, project: projectId })
				.populate('networks', 'name easyId')
				.populate('volumes', 'name easyId')
				.select(select)
				.then((aFunction) => {
					if (aFunction)
						resolve({
							status: 200,
							data: aFunction,
						});
					else resolve({ status: 404, data: { msg: 'Function not found.' } });
				});
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_function:main_orchestrator', process: processData });
};

module.exports = method;
