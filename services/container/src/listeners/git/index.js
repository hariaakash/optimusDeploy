const clone = require('./clone');

const listeners = (ch) => {
	clone(ch);
};

module.exports = listeners;
