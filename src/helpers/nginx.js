const rfr = require('rfr');
const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const mustache = require('mustache');
const Process = require('child_process');

const config = rfr('config');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function getFile() {
    return await readFile(path.resolve('./static/nginx.conf'));
}

async function outFile(data) {
    return await writeFile(path.resolve('./static/nginx2.conf'), data);
}

const createFile = (data, next) => {
    getFile()
        .then((response) => {
            return response.toString();
        })
        .then((response) => {
            return mustache.render(response, {
                domain: `${data.name}.${config.cloudflare.domain}`,
                port: data.port
            });
        })
        .then((response) => {
            return outFile(response);
        })
        .then((response) => next(null, 'Nginx file created.'))
};

const reload = (next) => {
    Process.exec('ls', (err) => {
        if (err) {
            next(err, 'Unable to restart nginx.');
        } else {
            next(null, 'Nginx restarted.');
        }
    });
};

const nginx = {
    createFile,
    reload,
};

module.exports = nginx;