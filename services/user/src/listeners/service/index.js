const main = require('./main');
const exists = require('./exists');
const existsRepo = require('./existsRepo');
const create = require('./create');
const remove = require('./remove');

const hookCreate = require('./hookCreate');
const hookRemove = require('./hookRemove');

const networkUsage = require('./networkUsage');
const networkAttach = require('./networkAttach');
const networkDetach = require('./networkDetach');

const volumeUsage = require('./volumeUsage');
const volumeAttach = require('./volumeAttach');
const volumeDetach = require('./volumeDetach');

const enablePublic = require('./enablePublic');

const tasks = (ch) => {
	main(ch);
	exists(ch);
	existsRepo(ch);
	create(ch);
	remove(ch);

	hookCreate(ch);
	hookRemove(ch);

	networkUsage(ch);
	networkAttach(ch);
	networkDetach(ch);

	volumeUsage(ch);
	volumeAttach(ch);
	volumeDetach(ch);

	enablePublic(ch);
};

module.exports = tasks;
