const main = require('./main');
const create = require('./create');
const remove = require('./remove');

const listeners = (ch) => {
	main(ch);
	create(ch);
	remove(ch);
};

module.exports = listeners;
