const user = require('./user');
const container = require('./container');

const tasks = (ch) => {
	user(ch);
	container(ch);
};

module.exports = tasks;
