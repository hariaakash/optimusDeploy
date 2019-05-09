const axios = require('axios');

const config = {
	client_id: process.env.GOOGLE_CLIENT_ID,
	client_secret: process.env.GOOGLE_CLIENT_SECRET,
	grant_type: 'authorization_code',
	url: {
		token: 'https://www.googleapis.com/oauth2/v4/token',
		info: 'https://www.googleapis.com/oauth2/v2/userinfo',
	},
	redirect_uri: 'http://localhost:8080/authHook/google',
};

const info = ({ tokenType, accessToken }) =>
	axios({
		method: 'GET',
		url: config.url.info,
		headers: { Authorization: `${tokenType} ${accessToken}`, Accept: 'application/json' },
	});

const auth = ({ code, data = {} }) =>
	axios({
		method: 'POST',
		url: config.url.token,
		headers: { Accept: 'application/json' },
		data: {
			code,
			grant_type: config.grant_type,
			redirect_uri: config.redirect_uri,
			client_id: config.client_id,
			client_secret: config.client_secret,
		},
	})
		.then(({ data: response }) => {
			data.userAuth = response;
			return info({
				tokenType: response.token_type,
				accessToken: response.access_token,
			});
		})
		.then(({ data: response }) => {
			data.userInfo = response;
			return data;
		});

const Google = { auth, info };

module.exports = Google;
