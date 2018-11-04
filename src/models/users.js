const rfr = require('rfr');
const mongoose = require('mongoose');

const logsSchema = rfr('src/models/logs');

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
    authKey: String,
    containers: [{
        type: Schema.Types.ObjectId,
        ref: 'Containers'
    }],
    logs: [logsSchema],
    created_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Users', userSchema);