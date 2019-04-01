const router = require('express').Router();

const network = require('../controllers/network');

router.get('/', network.main);
router.post('/', network.create);
router.delete('/', network.remove);

module.exports = router;
