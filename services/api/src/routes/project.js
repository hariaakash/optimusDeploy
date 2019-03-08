const router = require('express').Router();

const project = require('../controllers/project');

router.post('/create', project.create);

module.exports = router;
