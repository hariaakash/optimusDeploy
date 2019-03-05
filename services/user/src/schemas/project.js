const { Schema, model } = require('mongoose');

const projectSchema = new Schema({
	name: { type: String, required: true },
	userId: { type: Schema.Types.ObjectId, ref: 'User' },
	services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
	networks: [{ type: Schema.Types.ObjectId, ref: 'Network' }],
	info: {
		created_at: { type: Date, default: Date.now },
	},
});

module.exports = model('Project', projectSchema);
