const main = require('./main');
const create = require('./create');
const remove = require('./remove');

const networkAttach = require('./networkAttach');
const networkDetach = require('./networkDetach');

const listeners = (ch) => {
	main(ch);
	create(ch);
	remove(ch);

	networkAttach(ch);
	networkDetach(ch);
};

module.exports = listeners;
