const exists = require('./profile/exists');
const create = require('./profile/create');

const tasks = (ch) => {
	exists(ch);
	create(ch);
};

module.exports = tasks;
