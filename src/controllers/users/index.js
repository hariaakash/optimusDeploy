const rfr = require('rfr');

const methods = {
    main: rfr('src/controllers/users/main'),
    containers: rfr('src/controllers/users/containers'),
    register: rfr('src/controllers/users/register'),
    login: rfr('src/controllers/users/login'),
    logout: rfr('src/controllers/users/logout'),
    verifyEmail: rfr('src/controllers/users/verifyEmail'),
    sendEmailVerification: rfr('src/controllers/users/sendEmailVerification'),
};

module.exports = methods;