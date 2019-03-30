const User = require('../../schemas/user');

const { Github } = require('../../helpers/social');
const { rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ _id, source, repo }) =>
	new Promise(async (resolve) => {
		try {
			const data = {};
			const user = await User.findById(_id).select(`conf.social.${source}`);
			if (user.conf.social[source].enabled)
				data.branches = await Github.branches({
					accessToken: user.conf.social[source].access_token,
					repo,
				});
			resolve({ status: 200, data });
		} catch (err) {
			resolve({ status: 500 });
		}
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:branches_orchestrator', process: processData });
};

module.exports = method;
