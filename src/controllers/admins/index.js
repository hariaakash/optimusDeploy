const rfr = require('rfr');

const methods = {
    main: rfr('src/controllers/admins/main'),
    staffs: rfr('src/controllers/admins/staffs'),
    create: rfr('src/controllers/admins/create'),
    login: rfr('src/controllers/admins/login'),
    logout: rfr('src/controllers/admins/logout'),
    changePasswordAccount: rfr('src/controllers/admins/changePasswordAccount'),
    setPassword: rfr('src/controllers/admins/setPassword'),
    activity: rfr('src/controllers/admins/activity'),
    users: rfr('src/controllers/admins/users'),
    user: rfr('src/controllers/admins/user'),
    userActivity: rfr('src/controllers/admins/userActivity'),
    userContainerStats: rfr('src/controllers/admins/userContainerStats'),
    blockUser: rfr('src/controllers/admins/blockUser'),
    unblockUser: rfr('src/controllers/admins/unblockUser'),
    changeLimitUser: rfr('src/controllers/admins/changeLimitUser'),
};

module.exports = methods;