const Process = require('child_process');
const fs = require('fs-extra');

const create = (data, next) => {
    fs.ensureDir(`/srv/daemon-data/${data}`, (err) => {
        if (err) next(err, 'Unable to create volume.');
        else next(null, 'Directories exists/created.');
    });
};

const remove = (data, next) => {
    fs.remove(`/srv/daemon-data/${data}`, (err) => {
        if (err) next(err, 'Unable to delete volume.');
        else next(null, 'Volume Deleted.');
    });
};

const stats = (data, next) => {
    Process.exec(`du -sh /srv/daemon-data/${data}`, (err, data) => {
        if (err) next(err, 'Unable to compute size.');
        else next(null, data.split('\n')[0].split('\t')[0]);
    });
};

const volume = {
    create,
    remove,
    stats,
};

module.exports = volume;