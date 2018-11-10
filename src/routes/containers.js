const rfr = require('rfr');
const router = require('express').Router();

const containers = rfr('src/controllers/containers');

router.get('/', containers.main);

router.get('/stats', containers.stats);

router.post('/create', containers.create);

router.post('/delete', containers.delete);

router.post('/restart', containers.restart);

router.post('/start', containers.start);

router.post('/stop', containers.stop);

router.post('/pull', containers.pull);

router.post('/sftp', containers.sftp);

router.post('/sftpReset', containers.sftpReset);

module.exports = router;