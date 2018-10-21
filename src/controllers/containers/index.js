const rfr = require('rfr');

const methods = {
    list: rfr('src/controllers/containers/list'),
    create: rfr('src/controllers/containers/create'),
};

module.exports = methods;