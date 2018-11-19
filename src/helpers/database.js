const rfr = require('rfr');
const async = require('async');

const Mysql = rfr('src/helpers/mysql');
const Log = rfr('src/helpers/logger');

const createMysql = (data, next) => {
	async.auto({
		createUser: [(callback) => Mysql.user.create(data, callback)],
		createDB: [(callback) => Mysql.db.create(data.user, callback)],
		assignToDB: ['createUser', 'createDB', (result, callback) => Mysql.user.assignToDB(data.user, callback)],
	}, (err) => {
		if (err) {
			async.parallel({
				dropUser: (callback) => Mysql.user.drop(data.user, callback),
				dropDB: (callback) => Mysql.user.drop(data.user, callback),
			}, (err) => {
				next(err, 'Mysql DB creation failed.');
			});
		} else {
			next(null, 'Mysql DB created.');
		}
	});
};

const deleteMysql = (data, next) => {
	async.parallel({
		dropUser: (callback) => Mysql.user.drop(data, callback),
		dropDB: (callback) => Mysql.db.drop(data, callback),
	}, (err) => {
		if (err) Log.error(err);
		next(null, 'Mysql DB removed.');
	});
};

const create = (data, next) => {
	if (data.dbType == 'mysql') {
		createMysql(data, next);
	} else {
		next('dbNotFound', 'DB not available.');
	}
};

const remove = (data, next) => {
	if (data.dbType == 'mysql') {
		deleteMysql(data.user, next);
	} else {
		next('dbNotFound', 'DB not available.');
	}
};

const reset = (data, next) => {
	if (data.dbType == 'mysql') {
		Mysql.user.reset(data, next);
	} else {
		next('dbNotFound', 'DB not available.');
	}
};

const db = {
	create,
	remove,
	reset,
};

module.exports = db;