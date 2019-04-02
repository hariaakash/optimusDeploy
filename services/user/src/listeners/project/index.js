const exists = require('./exists');
const main = require('./main');
const create = require('./create');
const remove = require('./remove');

const networkCreate = require('./networkCreate');
const networkRemove = require('./networkRemove');
const serviceCreate = require('./serviceCreate');
const serviceRemove = require('./serviceRemove');

const tasks = (ch) => {
	exists(ch);
	main(ch);
	create(ch);
	remove(ch);

	networkCreate(ch);
	networkRemove(ch);
	serviceCreate(ch);
	serviceRemove(ch);
};

module.exports = tasks;
