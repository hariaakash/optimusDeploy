const rfr = require('rfr');
const router = require('express').Router();

const containers = rfr('src/controllers/containers');

router.get('/', containers.main);

router.post('/create', containers.create);

router.post('/delete', containers.delete);

router.post('/restart', containers.restart);

router.post('/start', containers.start);

router.post('/stop', containers.stop);

router.post('/pull', containers.pull);

module.exports = router;