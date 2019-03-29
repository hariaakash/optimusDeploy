const main = require('./main');
const exists = require('./exists');
const create = require('./create');
const authEmail = require('./authEmail');
const authGithub = require('./authGithub');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');
const repos = require('./repos');

const projectCreate = require('./projectCreate');
const projectRemove = require('./projectRemove');

const tasks = (ch) => {
	main(ch);
	exists(ch);
	create(ch);
	authEmail(ch);
	authGithub(ch);
	verifyEmail(ch);
	forgotPassword(ch);
	updatePassword(ch);
	repos(ch);

	projectCreate(ch);
	projectRemove(ch);
};

module.exports = tasks;
