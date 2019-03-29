const network = require('./network');
const service = require('./service');
const volume = require('./volume');

const tasks = (ch) => {
	try {
		network(ch);
		service(ch);
		volume(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
