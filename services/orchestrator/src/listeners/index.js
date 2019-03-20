const user = require('./user');
const project = require('./project');

const tasks = (ch) => {
	try {
		user(ch);
		project(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
