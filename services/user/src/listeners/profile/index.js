const main = require('./main');
const exists = require('./exists');
const create = require('./create');
const authEmail = require('./authEmail');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');

const projectCreate = require('./projectCreate');
const projectRemove = require('./projectRemove');

const tasks = (ch) => {
	main(ch);
	exists(ch);
	create(ch);
	authEmail(ch);
	verifyEmail(ch);
	forgotPassword(ch);
	updatePassword(ch);

	projectCreate(ch);
	projectRemove(ch);
};

module.exports = tasks;
