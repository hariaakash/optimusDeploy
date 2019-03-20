const main = require('./main');
const create = require('./create');
const auth = require('./auth');
const authGithub = require('./authGithub');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');

const methods = {
	main,
	create,
	auth,
	authGithub,
	verifyEmail,
	forgotPassword,
	updatePassword,
};

module.exports = methods;
