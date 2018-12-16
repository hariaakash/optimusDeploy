const rfr = require('rfr');
const mustache = require('mustache');
const Process = require('child_process');
const path = require('path');
const fs = require('fs');

const config = rfr('config');

const writeKey = (data, next) => {
    fs.writeFile(path.resolve(`/srv/daemon-data/${data.name}/tmp/key-${data.name}`), data.key, {
        mode: '400'
    }, (err) => {
        if (err) next(err, 'Unable to write SSH Keys.');
        else next(null, 'SSH Keys written.');
    })
};

const removeKey = (data, next) => {
    fs.unlink(path.resolve(`/srv/daemon-data/${data}/tmp/key-${data}`), (err) => {
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
    console.log(mustache.render(config.cmd.git.clone, {
        name: data.name,
        repo: data.repo,
    }));
    Process.exec(mustache.render(config.cmd.git.clone, {
        name: data.name,
        repo: data.repo,
    }), (err) => {
        if (err) next('gitClone', 'Unable to clone git, repo not found or invalid ssh key permissions.');
        else next(null, 'Git cloned.');
    });
};
const pull = (data, next) => {
    Process.exec(mustache.render(config.cmd.git.clone, {
        data,
    }), (err) => {
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