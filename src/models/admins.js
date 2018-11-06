const rfr = require('rfr');
const mongoose = require('mongoose');

const logsSchema = rfr('src/models/logs');

const Schema = mongoose.Schema;

const adminsSchema = new Schema({
    email: String,
    password: String,
    conf: {
        block: {
            type: Boolean,
            default: false
        },
        pToken: String,
    },
    adminKey: String,
    logs: [logsSchema],
    created_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Admins', adminsSchema);