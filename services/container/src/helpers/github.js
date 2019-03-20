const Process = require('child_process');

const Error = require('./utils').StatusCodeError;

const dir = process.env.DATA_DIR || '/srv/daemon-data';

const clone = ({ projectId, volumeId, accessToken, repo }) =>
	new Promise((resolve, reject) => {
		let cmd = `cd ${dir}/${projectId}/${volumeId} && `;
		cmd += `git clone https://${accessToken}@`;
		cmd += `${repo.replace('https://', '')} .`;
		Process.exec(cmd, (err) => {
			if (err) reject(new Error('Github repo clone failed', 500, err));
			else resolve();
		});
	});

const Github = { clone };

module.exports = Github;
