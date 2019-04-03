const User = require('../../schemas/user');

const { Github } = require('../../helpers/social');
const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ _id, source }) =>
	new Promise(async (resolve) => {
		try {
			const data = {};
			const user = await User.findById(_id).select(`conf.social.${source}`);
			if (user.conf.social[source].enabled) {
				data[source] = await Github.repos({
					accessToken: user.conf.social[source].access_token,
				});
				resolve({ status: 200, data });
			} else
				resolve({
					status: 404,
					data: {
						msg: `${source.charAt(0).toUpperCase()}${source.slice(1)} not enabled.`,
					},
				});
		} catch (err) {
			resolve({ status: 500 });
		}
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:repos_orchestrator', process: processData });
};

module.exports = method;
