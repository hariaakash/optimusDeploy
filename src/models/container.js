const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const containerSchema = new Schema({
    image: String,
    name: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Container', containerSchema);