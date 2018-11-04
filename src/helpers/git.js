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

const clone = (data, next) => {
    Process.exec(`cd /srv/daemon-data/${data.name}; GIT_SSH_COMMAND="ssh -i /srv/keys/${data.name}" git clone ${data.git} .`, (err) => {
        console.log(err);
        if (err) next('gitClone', 'Unable to clone git, repo not found or invalid ssh key permissions.');
        else next(null, 'Git cloned.');
    });
};
const pull = (data, next) => {
    Process.exec(`cd /srv/daemon-data/${data}; GIT_SSH_COMMAND="ssh -i /srv/keys/${data}" git pull`, (err) => {
        if (err) next(err, 'Unable to git pull.');
        else next(null, 'Git pull completed.');
    });
};

const git = {
    writeKey,
    removeKey,
    clone,
    pull,
};

module.exports = git;