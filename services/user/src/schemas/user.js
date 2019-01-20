const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	email: String,
	authKey: {
		token: String,
		setTime: {
			type: Date,
			default: Date.now,
		},
	},
	conf: {
		hashPassword: String,
		setPassword: {
			type: Boolean,
			default: true,
		},
		blocked: {
			type: Boolean,
			default: false,
		},
		pToken: String,
		eToken: String,
		emailVerified: {
			type: Boolean,
			default: false,
		},
	},
	info: {
		registered: {
			type: Date,
			default: Date.now,
		},
	},
});

module.exports = model('User', userSchema);
