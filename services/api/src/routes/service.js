const router = require('express').Router();

const service = require('../controllers/service');

router.post('/', service.create);
router.delete('/', service.remove);

module.exports = router;
