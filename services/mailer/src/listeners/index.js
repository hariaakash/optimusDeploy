const profile = require('./profile');

const tasks = (ch) => {
	try {
		profile(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
