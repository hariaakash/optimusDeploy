// const rfr = require('rfr');

// const User = rfr('src/models/users');

const request = (req, res) => {
    res.json({
        status: true,
        msg: 'main'
    });
};

module.exports = request;