const create = require('./create');
const update = require('./update');
const restart = require('./restart');
const network = require('./network');
const remove = require('./remove');

const listeners = (ch) => {
	create(ch);
	update(ch);
	restart(ch);
	network(ch);
	remove(ch);
};

module.exports = listeners;
