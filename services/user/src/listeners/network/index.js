const exists = require('./exists');
const create = require('./create');
const remove = require('./remove');

const tasks = (ch) => {
	exists(ch);
	create(ch);
	remove(ch);
};

module.exports = tasks;
