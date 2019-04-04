const clone = require('./clone');
const pull = require('./pull');

const listeners = (ch) => {
	clone(ch);
	pull(ch);
};

module.exports = listeners;
