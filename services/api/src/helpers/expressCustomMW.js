const bodyParserErrorHandler = (err, req, res, next) => {
	if (
		err instanceof SyntaxError &&
		err.status >= 400 &&
		err.status < 500 &&
		err.message.indexOf('JSON')
	)
		res.status(500).json({ msg: 'You sent a bad JSON' });
	else next();
};

const setChannel = (req, res, next, ch) => {
	req.ch = ch;
	next();
};

const mw = {
	bodyParserErrorHandler,
	setChannel,
};

module.exports = mw;
