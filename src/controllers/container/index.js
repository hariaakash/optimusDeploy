const rfr = require('rfr');

const methods = {
    list: rfr('src/controllers/container/list'),
    create: rfr('src/controllers/container/create'),
};

module.exports = methods;