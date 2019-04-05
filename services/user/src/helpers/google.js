const axios = require('axios');

const config = {
	client_id: process.env.GOOGLE_CLIENT_ID,
	client_secret: process.env.GOOGLE_CLIENT_SECRET,
	redirect_uri: 'https://optimuscp.io/oauth.html',
	grant_type: 'authorization_code',
	tokenUrl: 'https://www.googleapis.com/oauth2/v4/token',
	userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

const Google = {};

module.exports = Google;
