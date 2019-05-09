const nanoid = require('nanoid');

const User = require('../schemas/user');

const Github = require('./github');
const Google = require('./google');

const Production = process.env.NODE_ENV !== 'development';

const Config = {
	google: {
		url: 'https://accounts.google.com/o/oauth2/v2/auth',
		client_id: process.env.GOOGLE_CLIENT_ID,
		response_type: 'code',
		scope:
			'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
		redirect_uri: 'https://optimuscp.io/oauth.html',
		access_type: 'offline',
		params: () => {
			const params = [];
			params.push(`client_id=${Config.google.client_id}`);
			params.push(`response_type=${Config.google.response_type}`);
			params.push(`scope=${Config.google.scope}`);
			params.push(`redirect_uri=${Config.google.redirect_uri}`);
			params.push(`access_type=${Config.google.access_type}`);
			return params.join('&');
		},
		link: () => `${Config.google.url}?${Config.google.params()}`,
	},
	github: {
		url: 'https://github.com/login/oauth/authorize',
		client_id: process.env.GITHUB_CLIENT_ID,
		scope: 'user:email,repo,admin:repo_hook',
		redirect_uri: Production
			? process.env.GITHUB_HOOKURL
			: 'https://optimusdeploy.serveo.net/user/hookGithub',
		params: () => {
			const params = [];
			params.push(`client_id=${Config.github.client_id}`);
			params.push(`scope=${Config.github.scope}`);
			params.push(`redirect_uri=${Config.github.redirect_uri}`);
			return params.join('&');
		},
		link: () => `${Config.github.url}?${Config.github.params()}`,
	},
};

const handle = ({ userInfo, userAuth }, type) =>
	new Promise((resolve, reject) =>
		User.findOne({ email: userInfo.email }).then((user) => {
			if (user) {
				if (user.conf.social[type].enabled) {
					resolve({ authKey: user.authKey.token });
				}
				user.conf.social[type].enabled = true;
				if (type === 'github') user.conf.social[type].access_token = userAuth.access_token;
				else if (type === 'google')
					user.conf.social[type].refresh_token = userAuth.refresh_token;
				if (!user.conf.eVerified) user.conf.eVerified = true;
				user.save();
				resolve({ authKey: user.authKey.token });
			} else {
				const newUser = new User();
				newUser.email = userInfo.email;
				newUser.conf.social[type].enabled = true;
				if (type === 'github')
					newUser.conf.social[type].access_token = userAuth.access_token;
				else if (type === 'google')
					newUser.conf.social[type].refresh_token = userAuth.refresh_token;
				newUser.conf.setPassword = false;
				newUser.conf.eVerified = true;
				newUser.authKey.token = nanoid();
				newUser.save();
				resolve({ authKey: newUser.authKey.token });
			}
		})
	);

const Social = { Github, Google, handle, Config };

module.exports = Social;
