const create = require('./create');
// const verifyEmail = require('./verifyEmail');
// const forgotPassword = require('./forgotPassword');
// const updatePassword = require('./updatePassword');

const listeners = (ch) => {
	create(ch);
	// verifyEmail(ch);
	// forgotPassword(ch);
	// updatePassword(ch);
};

module.exports = listeners;
