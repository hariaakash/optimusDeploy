const main = require('./main');
const exists = require('./exists');
const create = require('./create');
const authEmail = require('./authEmail');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');

const tasks = (ch) => {
	main(ch);
	exists(ch);
	create(ch);
	authEmail(ch);
	verifyEmail(ch);
	forgotPassword(ch);
	updatePassword(ch);
};

module.exports = tasks;
