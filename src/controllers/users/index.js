const rfr = require('rfr');

const methods = {
    main: rfr('src/controllers/users/main'),
    register: rfr('src/controllers/users/register'),
    login: rfr('src/controllers/users/login'),
    logout: rfr('src/controllers/users/logout'),
    verifyEmail: rfr('src/controllers/users/verifyEmail'),
};

module.exports = methods;