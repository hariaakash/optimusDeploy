const create = require('./create');
const remove = require('./remove');

const listeners = (ch) => {
	create(ch);
	remove(ch);
};

module.exports = listeners;
