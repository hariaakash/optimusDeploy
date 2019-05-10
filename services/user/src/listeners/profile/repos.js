const User = require('../../schemas/user');

const { Github } = require('../../helpers/social');
const { rpcConsume } = require('../../helpers/amqp-wrapper');

const sources = ['github'];

const processData = ({ _id, source }) =>
	new Promise(async (resolve) => {
		try {
			const data = {};
			const options = source === '' ? 'conf.social' : `conf.social.${source}`;
			const user = await User.findById(_id).select(options);
			if (source !== '') {
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
			} else {
				const enabledSources = [];
				sources.forEach((x) => {
					if (user.conf.social[x].enabled) enabledSources.push(x);
				});
				resolve({ status: 200, data: { sources: enabledSources } });
			}
		} catch (err) {
			resolve({ status: 500 });
		}
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'user_profile:repos_orchestrator', process: processData });
};

module.exports = method;
