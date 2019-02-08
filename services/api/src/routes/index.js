const router = require('express').Router();

const user = require('./user');
const container = require('./container');

router.use('/user', user);
router.use('/container', container);

router.use('/*', (req, res) =>
	res.status(404).json({
		msg: 'You are lost for sure.',
	})
);

module.exports = router;
