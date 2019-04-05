const axios = require('axios');

const Production = process.env.NODE_ENV !== 'development';

const config = {
	client_id: process.env.GITHUB_CLIENT_ID,
	client_secret: process.env.GITHUB_CLIENT_SECRET,
	url: {
		token: 'https://github.com/login/oauth/access_token',
		info: 'https://api.github.com/user',
		userRepos: 'https://api.github.com/user/repos',
		repos: 'https://api.github.com/repos',
	},
};

config.hookUrl = Production
	? process.env.GITHUB_HOOKURL
	: 'https://optimusdeploy.serveo.net/user/hookGithub';

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
		url: config.url.userRepos,
		headers: { Authorization: `token ${accessToken}`, Accept: 'application/json' },
		params: { per_page: 1000, affiliation: 'owner,collaborator,organization_member' },
	}).then(({ data }) =>
		data.map((x) => ({ repo: x.full_name, default_branch: x.default_branch }))
	);

const branches = ({ accessToken, repo }) =>
	axios({
		method: 'GET',
		url: `${config.url.repos}/${repo}/branches`,
		headers: { Authorization: `token ${accessToken}`, Accept: 'application/json' },
	}).then(({ data }) => data.map((x) => x.name));

const createHook = ({ serviceId, accessToken, repo }) =>
	axios({
		method: 'POST',
		url: `${config.url.repos}/${repo}/hooks`,
		headers: { Authorization: `token ${accessToken}`, Accept: 'application/json' },
		data: { config: { url: `${config.hookUrl}/${serviceId}`, content_type: 'json' } },
	}).then(({ data }) => ({ id: data.id }));

const removeHook = ({ accessToken, repo, hookId }) =>
	axios({
		method: 'DELETE',
		url: `${config.url.repos}/${repo}/hooks/${hookId}`,
		headers: { Authorization: `token ${accessToken}`, Accept: 'application/json' },
	}).then(({ data }) => data);

const Github = { auth, info, repos, branches, hook: { create: createHook, remove: removeHook } };

module.exports = Github;
