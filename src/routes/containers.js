const rfr = require('rfr');
const router = require('express').Router();

const containers = rfr('src/controllers/containers');

router.post('/create', containers.create);

router.post('/delete', containers.delete);

router.post('/start', containers.start);

router.post('/stop', containers.stop);

module.exports = router;