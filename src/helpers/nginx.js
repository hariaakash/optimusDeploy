const rfr = require('rfr');
const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const mustache = require('mustache');
const Process = require('child_process');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

async function getFile() {
    return await readFile(path.resolve('./static/nginx.conf'));
}

async function outFile(name, data) {
    return await writeFile(path.resolve(`/etc/nginx/sites-available/${name}.conf`), data);
}

async function removeFile(name) {
    return await unlink(path.resolve(`/etc/nginx/sites-available/${name}.conf`));
}

const createFile = (data, next) => {
    getFile()
        .then((response) => {
            return response.toString();
        })
        .then((response) => {
            return mustache.render(response, {
                domain: data.name,
                port: data.port
            });
        })
        .then((response) => {
            return outFile(data.id, response);
        })
        .then((response) => {
            Process.exec(`sudo ln -s /etc/nginx/sites-available/${data.id}.conf /etc/nginx/sites-enabled/${data.id}.conf`, (err) => {
                if (err) {
                    next(err, 'Unable to creat nginx sys link.');
                } else {
                    next(null, 'Nginx file created.');
                }
            });
        });
};

const deleteFile = (data, next) => {
    removeFile(data)
        .then(() => {
            Process.exec(`rm /etc/nginx/sites-enabled/${data}.conf`, (err) => {
                next(null, 'Nginx file removed.');
            });
        });
};

const reload = (next) => {
    Process.exec('service nginx reload', (err) => {
        if (err) {
            next(err, 'Unable to restart nginx.');
        } else {
            next(null, 'Nginx restarted.');
        }
    });
};

const nginx = {
    createFile,
    deleteFile,
    reload,
};

module.exports = nginx;