const network = require('./network');
const service = require('./service');
const functions = require('./function');
const volume = require('./volume');
const git = require('./git');

const tasks = (ch) => {
	try {
		network(ch);
		service(ch);
		functions(ch);
		volume(ch);
		git(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
