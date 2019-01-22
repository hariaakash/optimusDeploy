const router = require('express').Router();

const user = require('./user');

router.use('/user', user);

router.use('/*', (req, res) =>
	res.status(404).json({
		msg: 'You are lost for sure.',
	})
);

module.exports = router;
