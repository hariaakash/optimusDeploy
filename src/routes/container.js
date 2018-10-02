const rfr = require('rfr');
const router = require('express').Router();

const container = rfr('src/controllers/container');

router.get('/', container.list);
router.post('/', container.create);

module.exports = router;