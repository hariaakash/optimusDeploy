const rfr = require('rfr');
const router = require('express').Router();

const container = rfr('src/controllers/containers');

router.get('/', container.list);
router.post('/create', container.create);

module.exports = router;