const rfr = require('rfr');
const router = require('express').Router();

const users = rfr('src/routes/users');

router.use('/users', users);

module.exports = router;