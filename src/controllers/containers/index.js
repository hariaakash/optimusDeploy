const rfr = require('rfr');

const methods = {
    main: rfr('src/controllers/containers/main'),
    create: rfr('src/controllers/containers/create'),
    delete: rfr('src/controllers/containers/delete'),
    restart: rfr('src/controllers/containers/restart'),
    start: rfr('src/controllers/containers/start'),
    stop: rfr('src/controllers/containers/stop'),
    pull: rfr('src/controllers/containers/pull'),
};

module.exports = methods;