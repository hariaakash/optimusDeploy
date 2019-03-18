const profile = require('./profile/');
const project = require('./project/');
const network = require('./network/');

const tasks = (ch) => {
	profile(ch);
	project(ch);
	network(ch);
};

module.exports = tasks;
