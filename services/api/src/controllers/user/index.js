const create = require('./create');
const auth = require('./auth');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
// const updatePassword = require('./updatePassword');

const methods = {
	create,
	auth,
	verifyEmail,
	forgotPassword,
	// updatePassword,
};

module.exports = methods;
