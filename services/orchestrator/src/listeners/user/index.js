const create = require('./create');
const auth = require('./auth');
const verifyEmail = require('./verifyEmail');

const listeners = (ch) => {
	create(ch);
	auth(ch);
	verifyEmail(ch);
};

module.exports = listeners;
