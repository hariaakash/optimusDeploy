// const rfr = require('rfr');

const request = (req, res) => {
    res.json({
        status: true,
        msg: 'main'
    });
};

module.exports = request;