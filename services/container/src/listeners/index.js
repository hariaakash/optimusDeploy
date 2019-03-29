const network = require('./network');
const service = require('./service');

const tasks = (ch) => {
	try {
		network(ch);
		service(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
