const create = require('./create');
const update = require('./update');
const remove = require('./remove');

const listeners = (ch) => {
	create(ch);
	update(ch);
	remove(ch);
};

module.exports = listeners;
