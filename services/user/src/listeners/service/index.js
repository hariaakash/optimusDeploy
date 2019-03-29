const exists = require('./exists');
const create = require('./create');
const remove = require('./remove');

const networkUsage = require('./networkUsage');

const tasks = (ch) => {
	exists(ch);
	create(ch);
	remove(ch);

	networkUsage(ch);
};

module.exports = tasks;
