const rfr = require('rfr');
const async = require('async');

const Mysql = rfr('src/helpers/mysql');
const Mongo = rfr('src/helpers/mongodb');
const Log = rfr('src/helpers/logger');

const addMysql = (data, next) => {
	async.auto({
		addUser: [(callback) => Mysql.user.add(data, callback)],
		addDB: [(callback) => Mysql.db.add(data.user, callback)],
		assignToDB: ['addUser', 'addDB', (result, callback) => Mysql.user.assignToDB(data.user, callback)],
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

const dropMysql = (data, next) => {
	async.parallel({
		dropUser: (callback) => Mysql.user.drop(data, callback),
		dropDB: (callback) => Mysql.db.drop(data, callback),
	}, (err) => {
		if (err) Log.error(err);
		next(null, 'Mysql DB removed.');
	});
};

const addMongo = (data, next) => {
	Mongo.user.add(data, (err, data) => {
		if (err) next(err, 'Mongo DB creation failed.');
		else next(null, 'Mongo DB created.');
	});
};

const dropMongo = (data, next) => {
	async.parallel({
		dropDB: (callback) => Mongo.db.drop(data, callback),
		dropUser: (callback) => Mongo.user.drop(data, callback),
	}, (err) => {
		if (err) Log.error(err);
		next(null, 'Mongo DB removed.');
	});
};

const resetMongo = (data, next) => {
	async.series({
		dropUser: (callback) => Mongo.user.drop(data.user, callback),
		addUser: (callback) => Mongo.user.add(data, callback),
	}, (err) => {
		if (err) next('resetUser', 'User password unable to reset.');
		else next(null, 'User password reset.');
	});
};

const add = (data, next) => {
	if (data.dbType == 'mysql') {
		addMysql(data, next);
	} else if (data.dbType == 'mongo') {
		addMongo(data, next);
	} else {
		next('dbNotFound', 'DB not available.');
	}
};

const drop = (data, next) => {
	if (data.dbType == 'mysql') {
		dropMysql(data.user, next);
	} else if (data.dbType == 'mongo') {
		dropMongo(data.user, next);
	} else {
		next('dbNotFound', 'DB not available.');
	}
};

const reset = (data, next) => {
	if (data.dbType == 'mysql') {
		Mysql.user.reset(data, next);
	} else if (data.dbType == 'mongo') {
		resetMongo(data, next);
	} else {
		next('dbNotFound', 'DB not available.');
	}
};

const db = {
	add,
	drop,
	reset,
};

module.exports = db;