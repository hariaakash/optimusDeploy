const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const databasesSchema = new Schema({
    name: String,
    dbType: String,
    pass: String,
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

module.exports = mongoose.model('Databases', databasesSchema);