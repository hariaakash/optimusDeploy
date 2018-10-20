const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    password: String,
    conf: {
        verfied: String,
        block: {
            type: Boolean,
            default: false
        }
    },
    authKey: [{
        type: Schema.Types.ObjectId,
        ref: 'AuthKey'
    }]
});

module.exports = mongoose.model('Users', userSchema);