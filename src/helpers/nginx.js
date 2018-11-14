const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const mustache = require('mustache');
const Process = require('child_process');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const symlink = promisify(fs.symlink);

async function getFile(uri) {
    return await readFile(path.resolve(uri));
}

async function outFile(name, data) {
    return await writeFile(path.resolve(`/etc/nginx/sites-available/${name}.conf`), data);
}

async function removeFile(name, link) {
    return await unlink(path.resolve(`/etc/nginx/sites-${link}/${name}.conf`));
}

async function symbolicLink(name) {
    return await symlink(`/etc/nginx/sites-available/${name}.conf`, `/etc/nginx/sites-enabled/${name}.conf`);
}

const createFile = (data, next) => {
    let nginxCustom = data.nginxCustomPre ? 'nginxCustomPre' : 'nginxCustomPost',
        nginxFile = data.custom ? nginxCustom : 'nginxDefault',
        nginxPath = `./static/${nginxFile}.conf`;
    getFile(nginxPath)
        .then((response) => {
            return response.toString();
        })
        .then((response) => {
            return mustache.render(response, {
                domain: data.name,
                port: data.port,
                containerId: data.id,
            });
        })
        .then((response) => {
            return outFile(data.id, response);
        })
        .then(() => {
            return data.symlink ? symbolicLink(data.id) : null;
        })
        .then(() => {
            next(null, 'Nginx file created.');
        });
};

const deleteFile = (data, next) => {
    removeFile(data, 'linked')
        .then(() => {
            return removeFile(data, 'available')
        })
        .then(() => {
            next(null, 'Nginx file removed.');
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

const changePort = (data, next) => {
    getFile(`/etc/nginx/sites-available/${data.id}.conf`)
        .then((response) => {
            return response.toString();
        })
        .then((response) => {
            let n = response.lastIndexOf(data.oldPort);
            return response.slice(0, n) + response.slice(n).replace(data.oldPort, data.newPort);
        })
        .then((response) => {
            return outFile(data.id, response);
        })
        .then((response) => {
            next(null, 'Nginx Configuration changed.');
        });
};

const nginx = {
    createFile,
    deleteFile,
    reload,
    changePort,
};

module.exports = nginx;