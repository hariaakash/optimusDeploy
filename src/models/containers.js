const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const containersSchema = new Schema({
    name: String,
    image: String,
    git: String,
    containerId: String, // Docker ID
    dnsId: String,
    port: String,
    nameCustom: Boolean,
    conf: {
        plan: {
            type: Schema.Types.ObjectId,
            ref: 'Plans'
        },
        blocked: {
            type: Boolean,
            default: false
        },
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Containers', containersSchema);