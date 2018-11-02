const rfr = require('rfr');

const methods = {
    create: rfr('src/controllers/containers/create'),
    delete: rfr('src/controllers/containers/delete'),
    restart: rfr('src/controllers/containers/restart'),
    start: rfr('src/controllers/containers/start'),
    stop: rfr('src/controllers/containers/stop'),
};

module.exports = methods;