const rfr = require('rfr');
const router = require('express').Router();

const users = rfr('src/routes/users');
const container = rfr('src/routes/container');

router.use('/webapi/users', users);
router.use('/webapi/container', container);

router.use('/*', (req, res) => res.json({
    status: false,
    msg: 'You are lost for sure.'
}));

module.exports = router;