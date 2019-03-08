const user = require('./user');
const project = require('./project');

const tasks = (ch) => {
	user(ch);
	project(ch);
};

module.exports = tasks;
