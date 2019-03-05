const profile = require('./profile/');
const project = require('./project/');

const tasks = (ch) => {
	profile(ch);
	project(ch);
};

module.exports = tasks;
