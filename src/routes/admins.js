const rfr = require('rfr');
const router = require('express').Router();

const admins = rfr('src/controllers/admins');

router.get('/', admins.main);

router.post('/create', admins.create);

router.post('/login', admins.login);

router.get('/logout', admins.logout);

router.post('/setPassword', admins.setPassword);

router.get('/activity', admins.activity);

router.get('/users', admins.users);

router.get('/user/:userId', admins.user);

module.exports = router;