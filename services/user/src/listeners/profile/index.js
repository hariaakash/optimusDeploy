const main = require('./main');
const exists = require('./exists');
const existsProject = require('./existsProject');
const create = require('./create');
const authEmail = require('./authEmail');
const authGithub = require('./authGithub');
const authGoogle = require('./authGoogle');
const verifyEmail = require('./verifyEmail');
const forgotPassword = require('./forgotPassword');
const updatePassword = require('./updatePassword');
const repos = require('./repos');
const branches = require('./branches');

const projectCreate = require('./projectCreate');
const projectRemove = require('./projectRemove');

const tasks = (ch) => {
	main(ch);
	exists(ch);
	existsProject(ch);
	create(ch);
	authEmail(ch);
	authGithub(ch);
	authGoogle(ch);
	verifyEmail(ch);
	forgotPassword(ch);
	updatePassword(ch);
	repos(ch);
	branches(ch);

	projectCreate(ch);
	projectRemove(ch);
};

module.exports = tasks;
