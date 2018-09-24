const rfr = require('rfr');
const mongoose = require('mongoose');

const config = rfr('config');
const dbURI = `mongodb://${config.mongoose.ip}:${config.mongoose.port}/${config.mongoose.db}`;

const DBConnection = (next) => {
	mongoose.connect(dbURI, {
			useNewUrlParser: true,
		})
		.then(() => {
			next(null, `MongoDB running on ${config.mongoose.ip}:${config.mongoose.port}`);
		})
		.catch((err) => {
			next(err);
		});
};

module.exports = DBConnection;