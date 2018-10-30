const rfr = require('rfr');

const methods = {
    create: rfr('src/controllers/containers/create'),
    delete: rfr('src/controllers/containers/delete'),
    stop: rfr('src/controllers/containers/stop'),
};

module.exports = methods;