const network = require('./network');

const tasks = (ch) => {
	try {
		network(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
