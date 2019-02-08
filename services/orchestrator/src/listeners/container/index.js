const createContainer = require('./createContainer');
// const deleteContainer = require('./deleteContainer');
// const stopContainer = require('./stopContainer');
// const restartCotainer = require('./restartContainer');
// const statusContainer = require('./statusContainer');
// const rebuildContainer = require('./rebuildContainer');

const listeners = (ch) => {
	createContainer(ch);
	// deleteContainer(ch);
	// stopContainer(ch);
	// restartContainer(ch);
	// statusContainer(ch);
	// rebuildContainer(ch);
};

module.exports = listeners;
