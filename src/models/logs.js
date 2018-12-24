const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const logsSchema = new Schema({
    ip: String,
    msg: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = logsSchema;