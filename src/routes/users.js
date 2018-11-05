const rfr = require('rfr');
const router = require('express').Router();

const users = rfr('src/controllers/users');

router.get('/', users.main);

router.get('/containers', users.containers);

router.post('/register', users.register);

router.post('/login', users.login);

router.get('/logout', users.logout);

router.post('/verifyEmail', users.verifyEmail);

router.post('/sendEmailVerification', users.sendEmailVerification);

module.exports = router;