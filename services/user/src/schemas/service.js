const { Schema, model } = require('mongoose');

const serviceSchema = new Schema({
	name: { type: String, required: true },
	easyId: { type: String, unique: true, required: true },
	project: { type: Schema.Types.ObjectId, ref: 'Project' },
	networks: [{ type: Schema.Types.ObjectId, ref: 'Network' }],
	info: {
		created_at: { type: Date, default: Date.now },
	},
});

module.exports = model('Service', serviceSchema);
