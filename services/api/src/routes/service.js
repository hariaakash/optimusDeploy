const router = require('express').Router();

const service = require('../controllers/service');

router.get('/', service.main);
router.post('/', service.create);
router.delete('/', service.remove);

module.exports = router;
