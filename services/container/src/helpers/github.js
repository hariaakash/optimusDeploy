const Process = require('child_process');

const Error = require('./utils').StatusCodeError;

const dir = process.env.DATA_DIR || '/srv/daemon-data';

const clone = ({ projectId, serviceId, accessToken, repo, branch }) =>
	new Promise((resolve, reject) => {
		const uri = `https://${accessToken}@github.com/${repo}`;
		const dest = `${dir}/${projectId}/${serviceId}`;
		const cmd = `git clone -b ${branch} --single-branch ${uri} ${dest}`;
		Process.exec(cmd, (err) => {
			if (err) reject(new Error('Github repo clone failed', 500, err));
			else resolve();
		});
	});

const pull = ({ projectId, serviceId, accessToken, repo, branch }) =>
	new Promise((resolve, reject) => {
		const uri = `https://${accessToken}@github.com/${repo}`;
		const dest = `${dir}/${projectId}/${serviceId}`;
		const cmd = [`rm -rf ${dest}`, `git clone -b ${branch} --single-branch ${uri} ${dest}`];
		Process.exec(cmd.join(' && '), (err) => {
			if (err) reject(new Error('Github repo pull failed', 500, err));
			else resolve();
		});
	});

const Github = { clone, pull };

module.exports = Github;
