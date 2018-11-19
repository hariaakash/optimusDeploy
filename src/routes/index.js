const rfr = require('rfr');
const router = require('express').Router();

const users = rfr('src/routes/users');
const admins = rfr('src/routes/admins');
const containers = rfr('src/routes/containers');
const databases = rfr('src/routes/databases');

router.use('/users', users);
router.use('/admins', admins);
router.use('/containers', containers);
router.use('/databases', databases);

router.use('/*', (req, res) => res.json({
    status: false,
    msg: 'You are lost for sure.'
}));

module.exports = router;