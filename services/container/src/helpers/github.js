const Process = require('child_process');

const Error = require('./utils').StatusCodeError;

const dir = process.env.DATA_DIR || '/srv/daemon-data';

const clone = ({ projectId, volumeId, accessToken, repo }) =>
	new Promise((resolve, reject) => {
		const uri = repo
			.slice(0, 8)
			.concat(accessToken)
			.concat('@')
			.concat(repo.slice(8));
		const cmd = `cd ${dir}/${projectId}/${volumeId} && git clone ${uri} .`;
		Process.exec(cmd, (err) => {
			if (err) reject(new Error('Github repo clone failed', 500, err));
			else resolve();
		});
	});

const Github = { clone };

module.exports = Github;
