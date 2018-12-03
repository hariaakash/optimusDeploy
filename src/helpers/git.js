const Process = require('child_process');
const path = require('path');
const fs = require('fs');

const writeKey = (data, next) => {
    fs.writeFile(path.resolve(`/srv/keys/${data.name}`), data.key, {
        mode: '400'
    }, (err) => {
        if (err) next(err, 'Unable to write SSH Keys.');
        else next(null, 'SSH Keys written.');
    })
};

const removeKey = (data, next) => {
    fs.unlink(path.resolve(`/srv/keys/${data}`), (err) => {
        if (err) next(err, 'Unable to remove SSH Keys.');
        else next(null, 'SSH Keys removed.');
    });
};

const cloneInit = (data, next) => {
    let repo = '';
    if (data.stack.includes('php'))
        repo = `https://github.com/hariaakash/op-php-starter`;
    else
        repo = `https://github.com/hariaakash/op-${data.stack}-starter`;
    const dir = `/srv/daemon-data/${data.name}/app/`;
    Process.exec(`cd ${dir} && git clone ${repo} . && rm -rf .git && chown -R ${data.name}:sftp ${dir} && chmod -R 755 ${dir}`, (err) => {
        if (err) next('gitClone', 'Unable to clone git init.');
        else next(null, 'Git init cloned.');
    });
};

const clone = (data, next) => {
    Process.exec(`cd /srv/daemon-data/${data.name}/app/; GIT_SSH_COMMAND="ssh -i /srv/keys/${data.name}" git clone ${data.git} .`, (err) => {
        if (err) next('gitClone', 'Unable to clone git, repo not found or invalid ssh key permissions.');
        else next(null, 'Git cloned.');
    });
};
const pull = (data, next) => {
    Process.exec(`cd /srv/daemon-data/${data}/app/; GIT_SSH_COMMAND="ssh -i /srv/keys/${data}" git pull`, (err) => {
        if (err) next(err, 'Unable to git pull.');
        else next(null, 'Git pull completed.');
    });
};

const git = {
    writeKey,
    removeKey,
    cloneInit,
    clone,
    pull,
};

module.exports = git;