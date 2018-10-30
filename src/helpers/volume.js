const Process = require('child_process');
const mkdirp = require('mkdirp');


const create = (data, next) => {
    mkdirp(`/srv/daemon-data/${data}`, (err) => {
        if (err) next(err, 'Unable to create volume.');
        else next(null, 'Directories exists/created.');
    });
};

const remove = (data, next) => {
    Process.exec(`rm -rf /srv/daemon-data/${data}`, (err) => {
        if (err) {
            next(err, 'Unable to delete volume.');
        } else {
            next(null, 'Volume Deleted.');
        }
    });
};

const volume = {
    create,
    remove,
};

module.exports = volume;