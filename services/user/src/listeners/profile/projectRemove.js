const User = require('../../schemas/user');

const { assert, consume } = require('../../helpers/amqp-wrapper');

const processData = ({ userId, projectId }) =>
	new Promise((resolve, reject) => {
		User.findOne({ _id: userId })
			.then((user) => {
				if (user) {
					user.projects = user.projects.filter((x) => String(x) !== projectId);
					user.save().then(() => resolve(true));
				} else resolve(true);
			})
			.catch((err) => reject);
	});

const method = (ch) => {
	assert({ ch, queue: 'user_profile:projectRemove_orchestrator' });
	consume({ ch, queue: 'user_profile:projectRemove_orchestrator', process: processData });
};

module.exports = method;
