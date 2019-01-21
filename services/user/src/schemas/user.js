const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	email: { type: String, required: true },
	authKey: {
		token: { type: String, required: true },
		setTime: { type: Date, default: Date.now },
	},
	conf: {
		hashPassword: { type: String, required: true },
		setPassword: { type: Boolean, default: true },
		blocked: { type: Boolean, default: false },
		pToken: String,
		eToken: String,
		emailVerified: { type: Boolean, default: false },
	},
	info: {
		registered_at: { type: Date, default: Date.now },
	},
});

module.exports = model('User', userSchema);
