const { Schema, model } = require('mongoose');

const projectSchema = new Schema({
	name: { type: String, required: true },
	easyId: { type: String, unique: true, required: true },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
	networks: [{ type: Schema.Types.ObjectId, ref: 'Network' }],
	volumes: [{ type: Schema.Types.ObjectId, ref: 'Volume' }],
	info: {
		domains: {
			default: { domainIds: [String], domain: String },
			custom: [String],
		},
		created_at: { type: Date, default: Date.now },
	},
});

module.exports = model('Project', projectSchema);
