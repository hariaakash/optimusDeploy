const router = require('express').Router();

const user = require('../controllers/user');

router.get('/', user.main);
router.post('/create', user.create);
router.post('/auth', user.auth);
router.post('/authGithub', user.authGithub);
router.post('/hookGithub', user.hookGithub);
router.post('/verifyEmail', user.verifyEmail);
router.post('/forgotPassword', user.forgotPassword);
router.post('/updatePassword', user.updatePassword);
router.get('/repos', user.repos);
module.exports = router;
