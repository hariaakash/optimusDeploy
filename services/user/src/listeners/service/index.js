const main = require('./main');
const exists = require('./exists');
const create = require('./create');
const remove = require('./remove');

const networkUsage = require('./networkUsage');
const networkAttach = require('./networkAttach');
const networkDetach = require('./networkDetach');

const tasks = (ch) => {
	main(ch);
	exists(ch);
	create(ch);
	remove(ch);

	networkUsage(ch);
	networkAttach(ch);
	networkDetach(ch);
};

module.exports = tasks;
