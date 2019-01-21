const create = require('./create');

const listeners = (ch) => {
	create(ch);
};

module.exports = listeners;
