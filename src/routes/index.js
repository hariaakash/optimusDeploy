const rfr = require('rfr');
const router = require('express').Router();

const users = rfr('src/routes/users');
const containers = rfr('src/routes/containers');

router.use('/webapi/users', users);
router.use('/webapi/containers', containers);

router.use('/*', (req, res) => res.json({
    status: false,
    msg: 'You are lost for sure.'
}));

module.exports = router;