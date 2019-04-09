const create = require('./create');
const update = require('./update');
const restart = require('./restart');
const network = require('./network');
const volume = require('./volume');
const remove = require('./remove');

const listeners = (ch) => {
	create(ch);
	update(ch);
	restart(ch);
	network(ch);
	volume(ch);
	remove(ch);
};

module.exports = listeners;
