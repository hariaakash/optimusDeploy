const nanoid = require('nanoid');

const User = require('../schemas/user');

const Github = require('./github');
const Google = require('./google');

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

const Social = { Github, Google, handle };

module.exports = Social;
