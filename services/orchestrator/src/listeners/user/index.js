const main = require('./main');
const create = require('./create');
const auth = require('./auth');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');
const repos = require('./repos');
const hookGithub = require('./hookGithub');

const listeners = (ch) => {
	main(ch);
	create(ch);
	auth(ch);
	verifyEmail(ch);
	forgotPassword(ch);
	updatePassword(ch);
	repos(ch);
	hookGithub(ch);
};

module.exports = listeners;
