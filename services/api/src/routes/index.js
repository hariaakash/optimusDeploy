const router = require('express').Router();

const user = require('./user');

router.use('/user', user);

router.use('/*', (req, res) =>
	res.json({
		status: false,
		msg: 'You are lost for sure.',
	})
);

module.exports = router;
