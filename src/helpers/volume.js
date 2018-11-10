const rfr = require('rfr');
const fse = require('fs-extra');
const mustache = require('mustache');
const Process = require('child_process');

const config = rfr('config');

const create = (data, next) => {
    Process.exec(mustache.render(config.sftp.createVolume, {
        name: data,
    }), (err) => {
        if (err) next(err, 'Unable to create volume.');
        else next(null, 'Directories exists/created.');
    });
};

const remove = (data, next) => {
    fse.remove(`/srv/daemon-data/${data}`, (err) => {
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