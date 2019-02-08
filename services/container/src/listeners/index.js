const manager = require('./manager');

const tasks = (ch) => {
	manager(ch);
};

module.exports = tasks;
