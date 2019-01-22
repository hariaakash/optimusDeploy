const exists = require('./exists');
const create = require('./create');
const authEmail = require('./authEmail');
const verifyEmail = require('./verifyEmail');

const tasks = (ch) => {
	exists(ch);
	create(ch);
	authEmail(ch);
	verifyEmail(ch);
};

module.exports = tasks;
