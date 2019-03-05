const main = require('./main');
const create = require('./create');
const auth = require('./auth');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');

const methods = {
	main,
	create,
	auth,
	verifyEmail,
	forgotPassword,
	updatePassword,
};

module.exports = methods;
