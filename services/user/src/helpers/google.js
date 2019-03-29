const axios = require('axios');

const config = {
	client_id: '666163516742-b89cg46pnk6o8p75b9btgp7o03gvv081.apps.googleusercontent.com',
	client_secret: 'OzxCxTGs8PJedpi4y1VeqdRH',
	redirect_uri: 'https://optimuscp.io/oauth.html',
	grant_type: 'authorization_code',
	tokenUrl: 'https://www.googleapis.com/oauth2/v4/token',
	userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

const Google = {};

module.exports = Google;
