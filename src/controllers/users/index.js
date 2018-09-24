const rfr = require('rfr');

const users = {
    main: rfr('src/controllers/users/main'),
    newUser: rfr('src/controllers/users/newUser')
};

module.exports = users;