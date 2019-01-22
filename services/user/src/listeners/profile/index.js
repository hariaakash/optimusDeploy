const exists = require('./exists');
const create = require('./create');
const authEmail = require('./authEmail');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');

const tasks = (ch) => {
	exists(ch);
	create(ch);
	authEmail(ch);
	verifyEmail(ch);
	forgotPassword(ch);
};

module.exports = tasks;
