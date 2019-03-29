const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	email: { type: String, required: true },
	authKey: {
		token: { type: String, required: true },
		setTime: { type: Date, default: Date.now },
	},
	conf: {
		hashPassword: { type: String },
		setPassword: { type: Boolean, default: true },
		blocked: { type: Boolean, default: false },
		pToken: String,
		eToken: String,
		eVerified: { type: Boolean, default: false },
		social: {
			github: {
				access_token: { type: String },
				enabled: { type: Boolean, default: false },
			},
		},
	},
	projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
	info: {
		registered_at: { type: Date, default: Date.now },
	},
});

module.exports = model('User', userSchema);
