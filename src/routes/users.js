const rfr = require('rfr');
const router = require('express').Router();

const users = rfr('src/controllers/users');

router.get('/', users.main);

router.post('/newUser', users.newUser);

module.exports = router;