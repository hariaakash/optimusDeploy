const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const authKeySchema = new Schema({
    key: String,
    createdAt: {
        type: Date,
        expires: 60,
        default: Date.now
    }
});

module.exports = mongoose.model('AuthKey', authKeySchema);