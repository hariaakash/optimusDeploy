const create = require('./create');
const auth = require('./auth');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');

const listeners = (ch) => {
	create(ch);
	auth(ch);
	verifyEmail(ch);
	forgotPassword(ch);
	updatePassword(ch);
};

module.exports = listeners;
