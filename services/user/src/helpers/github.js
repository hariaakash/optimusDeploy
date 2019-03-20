const axios = require('axios');

const config = {
	client_id: '129800c9747092aabe46',
	client_secret: '267225d33106584503b84551d493e77bbdd7b0b8',
	url: {
		token: 'https://github.com/login/oauth/access_token',
		info: 'https://api.github.com/user',
		repos: 'https://api.github.com/user/repos',
	},
};

const info = ({ accessToken }) =>
	axios({
		method: 'GET',
		url: config.url.info,
		headers: { Authorization: `token ${accessToken}`, Accept: 'application/json' },
	});

const auth = ({ code, data = {} }) =>
	axios({
		method: 'POST',
		url: config.url.token,
		headers: { Accept: 'application/json' },
		data: { code, client_id: config.client_id, client_secret: config.client_secret },
	})
		.then(({ data: response }) => {
			data.userAuth = response;
			return info({ accessToken: response.access_token });
		})
		.then(({ data: response }) => {
			data.userInfo = response;
			return data;
		});

const repos = ({ accessToken }) =>
	axios({
		method: 'GET',
		url: config.url.repos,
		headers: { Authorization: `token ${accessToken}`, Accept: 'application/json' },
		params: { per_page: 1000, affiliation: 'owner,collaborator,organization_member' },
	}).then(({ data }) =>
		data.map((x) => ({
			name: x.name,
			private: x.private,
			html_url: x.html_url,
		}))
	);

const Github = { auth, info, repos };

module.exports = Github;
