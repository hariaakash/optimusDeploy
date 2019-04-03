const main = require('./main');
const exists = require('./exists');
const create = require('./create');
const remove = require('./remove');

const hookCreate = require('./hookCreate');
const hookRemove = require('./hookRemove');

const networkUsage = require('./networkUsage');
const networkAttach = require('./networkAttach');
const networkDetach = require('./networkDetach');

const tasks = (ch) => {
	main(ch);
	exists(ch);
	create(ch);
	remove(ch);

	hookCreate(ch);
	hookRemove(ch);

	networkUsage(ch);
	networkAttach(ch);
	networkDetach(ch);
};

module.exports = tasks;
