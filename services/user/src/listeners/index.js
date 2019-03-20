const profile = require('./profile/');
const project = require('./project/');
const network = require('./network/');

const tasks = (ch) => {
	try {
		profile(ch);
		project(ch);
		network(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
