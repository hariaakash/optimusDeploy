const rfr = require('rfr');
const router = require('express').Router();

const admins = rfr('src/controllers/admins');

router.get('/', admins.main);

router.post('/create', admins.create);

router.post('/login', admins.login);

router.get('/logout', admins.logout);

router.post('/changePasswordAccount', admins.changePasswordAccount);

router.post('/setPassword', admins.setPassword);

router.get('/activity', admins.activity);

router.get('/users', admins.users);

router.get('/user/:userId', admins.user);

router.get('/userActivity/:userId', admins.userActivity);

router.post('/userContainerStats', admins.userContainerStats);

router.post('/blockUser', admins.blockUser);

router.post('/unblockUser', admins.unblockUser);

router.post('/changeLimitUser', admins.changeLimitUser);

module.exports = router;