const rfr = require('rfr');
const bcrypt = require('bcryptjs');
const hat = require('hat');

const Admin = rfr('src/models/admins');
const User = rfr('src/models/users');

const init = (next) => {
    User.find({})
        .then((users) => {
            users.forEach((user) => {
                user.conf.limit = {
                    containers: c,
                    databases: 1,
                };
                // user.save();
            });
        });
    Admin.findOne({
            email: 'smgdark@gmail.com'
        })
        .then((checkAdmin) => {
            if (checkAdmin) {
                next(null, 'Admin already exists.');
            } else {
                bcrypt.hash('haha1234', 10)
                    .then((hash) => {
                        var admin = new Admin();
                        admin.email = 'smgdark@gmail.com';
                        admin.password = hash;
                        admin.adminKey = hat();
                        admin.save();
                        next(null, 'Admin created.');
                    });
            }
        });
};

module.exports = init;