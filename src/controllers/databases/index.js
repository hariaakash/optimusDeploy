const rfr = require('rfr');

const methods = {
    create: rfr('src/controllers/databases/create'),
    delete: rfr('src/controllers/databases/delete'),
    reset: rfr('src/controllers/databases/reset'),
};

module.exports = methods;