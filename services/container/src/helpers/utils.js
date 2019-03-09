class StatusCodeError extends Error {
	constructor(message, status) {
		// Calling parent constructor of base Error class.
		super(message);

		// Capturing stack trace, excluding constructor call from it.
		Error.captureStackTrace(this, this.constructor);

		// `500` is the default value if not specified.
		this.statusCode = status || 500;
	}
}

module.exports = {
	StatusCodeError,
};
