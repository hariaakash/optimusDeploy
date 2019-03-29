const router = require('express').Router();

const user = require('./user');
const project = require('./project');
const network = require('./network');
const service = require('./service');

router.use('/user', user);
router.use('/project', project);
router.use('/network', network);
router.use('/service', service);

router.use('/*', (req, res) =>
	res.status(404).json({
		msg: 'You are lost for sure.',
	})
);

module.exports = router;
