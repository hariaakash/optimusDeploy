const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const containersSchema = new Schema({
    name: String,
    image: String,
    containerId: String, // Docker ID
    dnsId: String,
    port: String,
    dns: {
        name: String,
        custom: {
            type: Boolean,
            default: false
        },
    },
    git: {
        repo: String,
        enabled: {
            type: Boolean,
            default: false
        }
    },
    conf: {
        plan: {
            type: Schema.Types.ObjectId,
            ref: 'Plans'
        },
        blocked: {
            type: Boolean,
            default: false
        },
        sftp: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Containers', containersSchema);