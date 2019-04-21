const router = require('express').Router();

const functions = require('../controllers/function');

router.get('/', functions.main);
router.post('/', functions.create);
router.delete('/', functions.remove);

router.post('/network', functions.networkAttach);
router.delete('/network', functions.networkDetach);

router.post('/volume', functions.volumeAttach);
router.delete('/volume', functions.volumeDetach);

router.post('/enablePublic', functions.enablePublic);

module.exports = router;
