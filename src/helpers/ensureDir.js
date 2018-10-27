const mkdirp = require('mkdirp');
const ensureDir = (next) => {
    mkdirp('/srv/daemon-data', function (err) {
        if (err) next(err, 'Unable to create directories.');
        else next(null, 'Directories exists/created.');
    });
};

module.exports = ensureDir;