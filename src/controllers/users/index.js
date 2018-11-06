const rfr = require('rfr');

const methods = {
    main: rfr('src/controllers/users/main'),
    containers: rfr('src/controllers/users/containers'),
    register: rfr('src/controllers/users/register'),
    login: rfr('src/controllers/users/login'),
    logout: rfr('src/controllers/users/logout'),
    verifyEmail: rfr('src/controllers/users/verifyEmail'),
    sendEmailVerification: rfr('src/controllers/users/sendEmailVerification'),
    changePasswordAccount: rfr('src/controllers/users/changePasswordAccount'),
    forgotPassword: rfr('src/controllers/users/forgotPassword'),
    setPassword: rfr('src/controllers/users/setPassword'),
    activity: rfr('src/controllers/users/activity'),
};

module.exports = methods;