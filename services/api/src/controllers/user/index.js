const main = require('./main');
const create = require('./create');
const auth = require('./auth');
const authGithub = require('./authGithub');
const authGoogle = require('./authGoogle');
const hookGithub = require('./hookGithub');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');
const repos = require('./repos');

const methods = {
	main,
	create,
	auth,
	authGithub,
	authGoogle,
	hookGithub,
	verifyEmail,
	forgotPassword,
	updatePassword,
	repos,
};

module.exports = methods;
