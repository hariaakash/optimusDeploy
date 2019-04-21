const main = require('./main');
const create = require('./create');
const remove = require('./remove');

const networkAttach = require('./networkAttach');
const networkDetach = require('./networkDetach');

const volumeAttach = require('./volumeAttach');
const volumeDetach = require('./volumeDetach');

const enablePublic = require('./enablePublic');

const listeners = (ch) => {
	main(ch);
	create(ch);
	remove(ch);

	networkAttach(ch);
	networkDetach(ch);

	volumeAttach(ch);
	volumeDetach(ch);

	enablePublic(ch);
};

module.exports = listeners;
