const exists = require('./exists');
const create = require('./create');
const remove = require('./remove');

const networkCreate = require('./networkCreate');

const tasks = (ch) => {
	exists(ch);
	create(ch);
	remove(ch);

	networkCreate(ch);
};

module.exports = tasks;
