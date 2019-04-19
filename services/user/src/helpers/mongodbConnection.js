const mongoose = require('mongoose');

const host = process.env.MONGODB_HOST || 'mongodb://localhost';
const port = process.env.MONGODB_PORT || 27017;
const db = process.env.MONGODB_DB || 'opdp-test';

const dbURI = `${host}:${port}/${db}`;

let isConnectedBefore = false;

const connect = () => mongoose.connect(dbURI, { useNewUrlParser: true, useCreateIndex: true });

connect();

mongoose.connection.on('error', () => {
	// console.log('MongoDB: Could not connect');
});

mongoose.connection.on('disconnected', () => {
	console.log('MongoDB: Lost connection');
	if (!isConnectedBefore) setTimeout(connect, 5000);
});
mongoose.connection.on('connected', () => {
	isConnectedBefore = true;
	console.log('MongoDB: Connected');
});

mongoose.connection.on('reconnected', () => {
	console.log('MongoDB: Reconnected');
});

module.exports = {};
