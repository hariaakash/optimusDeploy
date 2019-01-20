const task1 = require('./task1');
const task2 = require('./task2');
const task3 = require('./task3');

const tasks = (ch) => {

    task1(ch);
    task2(ch);
    task3(ch);

};

module.exports = tasks;