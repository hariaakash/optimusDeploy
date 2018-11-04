const rfr = require('rfr');
const fs = require('fs-extra');
const async = require('async');

const config = rfr('config');

const ensureDir = (next) => {
    async.each(config.directories, (data, callback) => {
        fs.ensureDir(data, function (err) {
            if (err) callback(err);
            else callback();
        });
    }, (err) => {
        if (err) next(err, 'Unable to create directory.');
        else next(null, 'Directories exists/created.');
    });
};

module.exports = ensureDir;