const { Schema, model } = require('mongoose');

const serviceSchema = new Schema({
	name: { type: String, required: true },
	easyId: { type: String, unique: true, required: true },
	project: { type: Schema.Types.ObjectId, ref: 'Project' },
	networks: [{ type: Schema.Types.ObjectId, ref: 'Network' }],
	info: {
		port: { type: Number, required: true },
		domain: [{ type: String }],
		image: {
			name: { type: String, required: true },
			registry: { type: String, default: 'global' },
		},
		repo: {
			source: String,
			name: String,
			branch: String,
			hookId: String,
			enabled: { type: Boolean, default: false },
			pulled_at: { type: Date, default: Date.now },
		},
		enablepublic: { type: Boolean, default: false },
		created_at: { type: Date, default: Date.now },
	},
});

module.exports = model('Service', serviceSchema);
