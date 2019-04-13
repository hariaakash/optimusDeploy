const main = require('./main');
const create = require('./create');
const remove = require('./remove');

const networkAttach = require('./networkAttach');
const networkDetach = require('./networkDetach');

const volumeAttach = require('./volumeAttach');
const volumeDetach = require('./volumeDetach');

const enablePublic = require('./enablePublic');

const methods = {
	main,
	create,
	remove,

	networkAttach,
	networkDetach,

	volumeAttach,
	volumeDetach,

	enablePublic,
};

module.exports = methods;
