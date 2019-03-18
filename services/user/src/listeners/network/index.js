const create = require('./create');
const remove = require('./remove');

const tasks = (ch) => {
	create(ch);
	remove(ch);
};

module.exports = tasks;
