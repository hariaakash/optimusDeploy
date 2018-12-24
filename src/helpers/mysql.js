const rfr = require('rfr');

const config = rfr('config');

const pool = require('mysql').createPool(config.mysql);

const addUser = (data, next) => {
    pool.query(`CREATE USER '${data.user}'@'%' IDENTIFIED BY '${data.pass}'`, (err) => {
        if (err) next('createUser', 'User creation failed.');
        else next(null, 'User created.');
    });
};

const dropUser = (data, next) => {
    pool.query(`DROP USER IF EXISTS ${data}`, (err) => {
        if (err) next('dropUser', 'User drop failed.');
        else next(null, 'User deleted.');
    });
};

const resetUser = (data, next) => {
    pool.query(`ALTER USER '${data.user}'@'%' IDENTIFIED BY '${data.pass}'`, (err) => {
        if (err) next('resetUser', 'User password unable to reset.');
        else next(null, 'User password reset.');
    });
};

const assignUserToDB = (data, next) => {
    pool.query(`GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX, EXECUTE ON ${data}.* TO '${data}'@'%'`, (err) => {
        if (err) next('assignUserToDB', 'Unable to set user permission.');
        else next(null, 'User permission to db set.');
    });
};

const addDB = (data, next) => {
    pool.query(`CREATE DATABASE ${data}`, (err) => {
        if (err) next('createDB', 'DB creation failed.');
        else next(null, 'DB created.');
    });
};

const dropDB = (data, next) => {
    pool.query(`DROP DATABASE IF EXISTS ${data}`, (err) => {
        if (err) next('dropDB', 'DB drop failed.');
        else next(null, 'DB dropped.');
    });
};

const mysql = {
    user: {
        add: addUser,
        drop: dropUser,
        reset: resetUser,
        assignToDB: assignUserToDB,
    },
    db: {
        add: addDB,
        drop: dropDB,
    },
};

module.exports = mysql;