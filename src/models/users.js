const rfr = require('rfr');
const mongoose = require('mongoose');

const logsSchema = rfr('src/models/logs');

const Schema = mongoose.Schema;

const usersSchema = new Schema({
    email: String,
    password: String,
    conf: {
        verified: String, // 'true' or the token to verify email
        block: {
            type: Boolean,
            default: true
        },
        pToken: String, // Token used to change password
        setPassword: { // If true password is set
            type: Boolean,
            default: true,
        },
        limit: {
            containers: {
                type: Number,
                default: 1,
            },
            databases: {
                type: Number,
                default: 1,
            },
        },
    },
    social: {
        google: {
            id: String,
            refresh_token: String,
            enabled: {
                type: Boolean,
                default: false,
            }
        },
        github: {
            id: String,
            refresh_token: String,
            enabled: {
                type: Boolean,
                default: false,
            }
        },
    },
    authKey: String,
    containers: [{
        type: Schema.Types.ObjectId,
        ref: 'Containers'
    }],
    databases: [{
        type: Schema.Types.ObjectId,
        ref: 'Databases'
    }],
    logs: [logsSchema],
    created_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Users', usersSchema);