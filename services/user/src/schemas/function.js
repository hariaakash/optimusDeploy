const { Schema, model } = require('mongoose');

const functionSchema = new Schema({
	name: { type: String, required: true },
	easyId: { type: String, unique: true, required: true },
	project: { type: Schema.Types.ObjectId, ref: 'Project' },
	networks: [{ type: Schema.Types.ObjectId, ref: 'Network' }],
	volumes: [{ type: Schema.Types.ObjectId, ref: 'Volume' }],
	info: {
		domain: [{ type: String }],
		image: {
			name: { type: String, required: true },
			registry: { type: String, default: 'global' },
		},
		enablePublic: { type: Boolean, default: false },
		created_at: { type: Date, default: Date.now },
	},
});

module.exports = model('Function', functionSchema);
