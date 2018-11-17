const rfr = require('rfr');
const Process = require('child_process');
const mustache = require('mustache');

const config = rfr('config');

const create = (data, next) => {
    Process.exec(mustache.render(config.cmd.certbot.create, data), (err) => {
        if (err) {
            next(err, 'Unable to create SSL.');
        } else {
            next(null, 'SSL Created.');
        }
    });
};

const certbot = {
    create,
};

module.exports = certbot;