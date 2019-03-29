const mongoose = require('mongoose');

const host = process.env.MONGODB_HOST || 'mongodb://localhost';
const port = process.env.MONGODB_PORT || 27017;
const db = process.env.MONGODB_DB || 'opdp-test';

const dbURI = `${host}:${port}/${db}`;

const connect = () => {
	mongoose
		.connect(dbURI, { useNewUrlParser: true, useCreateIndex: true })
		.then(() => console.log('MongoDB: Connected'))
		.catch((err) => console.log(`MongoDB: Connection failed: ${err.message}`));
};

module.exports = connect;
