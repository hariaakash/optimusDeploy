const router = require('express').Router();

const service = require('../controllers/service');

router.get('/', service.main);
router.post('/', service.create);
router.delete('/', service.remove);

router.post('/network', service.networkAttach);
router.delete('/network', service.networkDetach);

module.exports = router;
