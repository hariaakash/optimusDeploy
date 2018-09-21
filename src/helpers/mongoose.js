const rfr = require('rfr');
const mongoose = require('mongoose');

const config = rfr('config');
const Log = rfr('src/helpers/logger');

const DBConnection = () => {
    mongoose.connect(`mongodb://${config.mongoose.ip}:${config.mongoose.port}/${config.mongoose.db}`, {
            useNewUrlParser: true,
        })
        .then(() => {
            Log.info(`MongoDB running on ${config.mongoose.ip}:${config.mongoose.port}`);
        })
        .catch(err => {
            Log.error({
                msg: 'MongoDB connection failed',
                err,
            });
        });
};

module.exports = DBConnection;
