const Process = require('child_process');

const fse = require('fs-extra');

const dir = '/srv/daemon-data';

const create = ({ projectId, volumeId, next }) =>
	fse.ensureDir(`${dir}/${projectId}/${volumeId}`, (err) => {
		if (err) next(new Error('Unable to create volume', 401, err));
		else next(null, 'Volume Created.');
	});

const remove = ({ projectId, volumeId, next }) =>
	fse.remove(`${dir}/${projectId}/${volumeId}`, (err) => {
		if (err) next(new Error('Unable to delete volume', 401, err));
		else next(null, 'Volume Deleted.');
	});

const stats = ({ projectId, volumeId, next }) =>
	Process.exec(`du -sh ${dir}/${projectId}/${volumeId}`, (err, data) => {
		if (err) next(new Error('Unable to compute size.', 401, err));
		else next(null, data.split('\n')[0].split('\t')[0]);
	});

const Volume = { create, remove, stats };

module.exports = Volume;
