const rfr = require('rfr');
const mongoose = require('mongoose');


const config = rfr('config');

module.exports = function() {
    mongoose.connect('mongodb://' + config.mongoose.ip + ':' + config.mongoose.port + '/' + config.mongoose.db, {
            useNewUrlParser: true
        })
        .then(function() {
            console.log('MongoDB running on ' + config.mongoose.ip + ':' + config.mongoose.port);
        })
        .catch(function(err) {
            console.log('MongoDB connection failed');
            console.log(err.message);
        });
};
