const { Schema, model } = require('mongoose');

const volumeSchema = new Schema({
	name: { type: String, required: true },
	easyId: { type: String, required: true },
	project: { type: Schema.Types.ObjectId, ref: 'Project' },
	info: {
		created_at: { type: Date, default: Date.now },
	},
});

module.exports = model('Volume', volumeSchema);
