const profile = require('./profile/');
const domain = require('./domain/');
const project = require('./project/');
const service = require('./service/');
const network = require('./network/');
const volume = require('./volume/');

const tasks = (ch) => {
	try {
		profile(ch);
		domain(ch);
		project(ch);
		service(ch);
		network(ch);
		volume(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
