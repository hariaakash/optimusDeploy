const rfr = require('rfr');
const mongoose = require('mongoose');

const config = rfr('config');

const DBConnection = (next) => {
	mongoose.connect(`mongodb://${config.mongoose.ip}:${config.mongoose.port}/${config.mongoose.db}`, {
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