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

router.post('/sftp', containers.sftp);

router.post('/sftpReset', containers.sftpReset);

router.post('/setDns', containers.setDns);

router.post('/setGit', containers.setGit);

router.post('/gitPull', containers.gitPull);

module.exports = router;