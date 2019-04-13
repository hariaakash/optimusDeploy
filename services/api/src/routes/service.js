const router = require('express').Router();

const service = require('../controllers/service');

router.get('/', service.main);
router.post('/', service.create);
router.delete('/', service.remove);

router.post('/network', service.networkAttach);
router.delete('/network', service.networkDetach);

router.post('/volume', service.volumeAttach);
router.delete('/volume', service.volumeDetach);

router.post('/enablePublic', service.enablePublic);

module.exports = router;
