const rfr = require('rfr');

const methods = {
    list: rfr('src/controllers/containers/list'),
    create: rfr('src/controllers/containers/create'),
    delete: rfr('src/controllers/containers/delete'),
};

module.exports = methods;