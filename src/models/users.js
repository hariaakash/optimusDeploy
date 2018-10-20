const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    password: String,
    conf: {
        verified: String,
        block: {
            type: Boolean,
            default: false
        }
    },
    authKey: String
});

module.exports = mongoose.model('Users', userSchema);