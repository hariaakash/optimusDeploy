const create = require('./create');
const auth = require('./auth');

const listeners = (ch) => {
	create(ch);
	auth(ch);
};

module.exports = listeners;
