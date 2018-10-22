const rfr = require('rfr');
const router = require('express').Router();

const containers = rfr('src/controllers/containers');

router.get('/', containers.list);

router.post('/create', containers.create);

router.post('/delete', containers.delete);

module.exports = router;