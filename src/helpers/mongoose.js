const rfr = require('rfr');
const hat = require('hat');
const mongoose = require('mongoose');
const cron = require('node-cron');

const User = rfr('src/models/users');

const config = rfr('config');
const dbURI = `mongodb://${config.mongoose.ip}:${config.mongoose.port}/${config.mongoose.db}`;

cron.schedule('0 4 * * *', () => {
	User.find({})
		.then( (users) => {
			for(i=0;i<users.length;i++){
				users[i].authKey = hat();
				users[i].save();
			}
		});
	console.log('Regenerated authkeys');
});

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