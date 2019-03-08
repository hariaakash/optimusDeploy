const exists = require('./exists');
const create = require('./create');

const tasks = (ch) => {
	exists(ch);
	create(ch);
};

module.exports = tasks;
