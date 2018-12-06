const rfr = require('rfr');
const MongoClient = require('mongodb').MongoClient

const config = rfr('config');
const dbURI = `mongodb://${config.mongooseSlave.user}:${config.mongooseSlave.password}@${config.mongooseSlave.host}:${config.mongooseSlave.port}`;

const connection = MongoClient.connect(dbURI, {
    useNewUrlParser: true
});

const addUser = (data, next) => {
    connection.then((client) => {
            client.db(data.user).addUser(data.user, data.pass, {
                roles: [{
                    role: 'readWrite',
                    db: data.user
                }]
            }, (err) => {
                if (err) next('createUser', 'User creation failed.');
                else next(null, 'User created.');
            });
        })
        .catch(() => {
            next('createUser', 'DB connection failed.');
        });
};

const dropUser = (data, next) => {
    connection.then((client) => {
            client.db(data).removeUser(data, {}, (err) => {
                if (err) {
                    if (err.errmsg.includes('not found')) next(null, 'User deleted.');
                    else next('dropUser', 'User drop failed.');
                } else next(null, 'User deleted.');
            });
        })
        .catch(() => {
            next('dropUser', 'DB connection failed.');
        });
};

const dropDB = (data, next) => {
    connection.then((client) => {
            client.db(data).dropDatabase((err) => {
                if (err) next('dropDB', 'DB drop failed.');
                else next(null, 'DB dropped.');
            });
        })
        .catch(() => {
            next('dropDB', 'DB connection failed.');
        });
};

const mongodb = {
    user: {
        add: addUser,
        drop: dropUser,
    },
    db: {
        drop: dropDB,
    },
};

module.exports = mongodb;