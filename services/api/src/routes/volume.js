const router = require('express').Router();

const volume = require('../controllers/volume');

router.get('/', volume.main);
router.post('/', volume.create);
router.delete('/', volume.remove);

module.exports = router;
