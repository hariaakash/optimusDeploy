class StatusCodeError extends Error {
	constructor(message, status = 500, data = {}) {
		// Calling parent constructor of base Error class.
		super(message);

		// Capturing stack trace, excluding constructor call from it.
		Error.captureStackTrace(this, this.constructor);

		// Assign custom data.
		this.statusCode = status;
		this.data = data;
	}
}

module.exports = {
	StatusCodeError,
};
