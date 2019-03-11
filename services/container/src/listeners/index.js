const network = require('./network');

const tasks = (ch) => {
	network(ch);
};

module.exports = tasks;
