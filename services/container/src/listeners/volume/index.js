const create = require('./create');
const remove = require('./remove');
const projectRemove = require('./projectRemove');

const listeners = (ch) => {
	create(ch);
	remove(ch);
	projectRemove(ch);
};

module.exports = listeners;
