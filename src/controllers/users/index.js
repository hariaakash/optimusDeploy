const rfr = require('rfr');

const methods = {
    main: rfr('src/controllers/users/main'),
    newUser: rfr('src/controllers/users/newUser')
};

module.exports = methods;