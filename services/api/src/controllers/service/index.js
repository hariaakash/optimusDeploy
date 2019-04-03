const main = require('./main');
const create = require('./create');
const remove = require('./remove');

const networkAttach = require('./networkAttach');
const networkDetach = require('./networkDetach');

const methods = {
	main,
	create,
	remove,

	networkAttach,
	networkDetach,
};

module.exports = methods;
