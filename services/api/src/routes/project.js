const router = require('express').Router();

const project = require('../controllers/project');

router.post('/', project.create);
router.delete('/', project.remove);

module.exports = router;
