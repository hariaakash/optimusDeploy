const { Schema, model } = require('mongoose');

const networkSchema = new Schema({
	name: { type: String, required: true },
	dockerId: String,
	info: {
		created_at: { type: Date, default: Date.now },
	},
});

module.exports = model('Network', networkSchema);
