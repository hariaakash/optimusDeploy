const task1 = require('./task1');
const task2 = require('./task2');
const task3 = require('./task3');

const tasks = (ch) => {
	try {
		task1(ch);
		task2(ch);
		task3(ch);
	} catch (err) {
		console.log(err);
	}
};

module.exports = tasks;
