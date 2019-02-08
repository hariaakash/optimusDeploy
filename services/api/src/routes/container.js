const router = require('express').Router();

const container = require('../controllers/container');

router.post('/createContainer', container.createContainer);
// router.post('/deleteContainer', container.deleteContainer);
// router.post('/stopContainer', container.stopContainer);
// router.post('/restartContainer', container.restartContainer);
// router.post('/statusContainer', container.statusContainer);
// router.post('/rebuildContainer', container.rebuildContainer);

module.exports = router;
