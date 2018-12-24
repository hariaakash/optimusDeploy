const rfr = require('rfr');
const router = require('express').Router();

const databases = rfr('src/controllers/databases');

router.post('/create', databases.create);

router.post('/delete', databases.delete);

router.post('/reset', databases.reset);

module.exports = router;