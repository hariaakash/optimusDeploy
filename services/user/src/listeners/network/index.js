const main = require('./main');
const exists = require('./exists');
const create = require('./create');
const remove = require('./remove');

const tasks = (ch) => {
	main(ch);
	exists(ch);
	create(ch);
	remove(ch);
};

module.exports = tasks;
