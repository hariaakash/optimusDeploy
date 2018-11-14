const rfr = require('rfr');
const async = require('async');

const config = rfr('config');

const User = rfr('src/models/users');
const Container = rfr('src/models/containers');

const Dns = rfr('src/helpers/dns');
const Nginx = rfr('src/helpers/nginx');
const Certbot = rfr('src/helpers/certbot');

const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.authKey && req.body.containerId && req.body.domain) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then((user) => {
                if (user) {
                    async.auto({
                        checkContainer: [(callback) => {
                            Container.findOne({
                                    _id: req.body.containerId
                                })
                                .then((container) => {
                                    if (container) {
                                        if (user.containers.indexOf(req.body.containerId) > -1) {
                                            if (!container.dns.custom) {
                                                req.body.dockerId = container.containerId;
                                                req.body.container = container;
                                                callback(null, 'Container found.');
                                            } else {
                                                callback('dnsSet', 'DNS is already set.');
                                            }
                                        } else {
                                            callback('checkContainer', 'Container not found.');
                                        }
                                    } else {
                                        callback('checkContainer', 'Container not found.');
                                    }
                                })
                                .catch((err) => {
                                    callback(err, 'Some error occurred when trying to check existing container.');
                                });
                        }],
                        dnsLookup: ['checkContainer', (result, callback) => {
                            Dns.lookup(req.body.domain, callback);
                        }],
                        createNginxPre: ['validateName', 'checkContainer', 'dnsLookup', (result, callback) => {
                            let domain = `${req.body.container.name}.${config.cloudflare.domain} ${req.body.domain}`;
                            Nginx.createFile({
                                id: req.body.containerId,
                                name: domain,
                                custom: true,
                                port: req.body.container.port,
                                symlink: false,
                                nginxCustomPre: true,
                            }, callback);
                        }],
                        reloadNginx: ['createNginxPre', (result, callback) => {
                            Nginx.reload(callback);
                        }],
                        getCertificate: ['reloadNginx', (result, callback) => {
                            Certbot.create({
                                email: user.email,
                                id: req.body.containerId,
                                domain: req.body.domain,
                            }, callback);
                        }],
                        createNginxPost: ['getCertificate', (result, callback) => {
                            let domain = `${req.body.container.name}.${config.cloudflare.domain} ${req.body.domain}`;
                            Nginx.createFile({
                                id: req.body.containerId,
                                name: domain,
                                custom: true,
                                port: req.body.container.port,
                                symlink: false,
                            }, callback);
                        }],
                        reloadNginxAgain: ['createNginxPost', (result, callback) => {
                            Nginx.reload(callback);
                        }],
                        saveData: ['getCertificate', (result, callback) => {
                            req.body.container.dns.name = req.body.domain;
                            req.body.container.dns.custom = true;
                            req.body.container.save();
                            user.logs.push({
                                ip: req.clientIp,
                                msg: `Container dns set with id: ${req.body.containerId} and name: ${req.body.domain}`
                            });
                            user.save();
                            callback(null);
                        }],
                    }, (err, result) => {
                        if (err) {
                            if (err == 'checkContainer' || err == 'dnsSet') {
                                uniR(res, false, result.checkContainer);
                            } else if (err == 'dnsLookup') {
                                uniR(res, false, result.dnsLookup);
                            } else {
                                Log.error(err);
                                uniR(res, false, 'Unable to set dns container.');
                            }
                        } else {
                            uniR(res, true, 'DNS Set.');
                        }
                    });
                } else {
                    uniR(res, true, 'Session expired, login to continue.');
                }
            })
            .catch((err) => {
                uniR(res, false, 'Some error occurred.');
            });
    } else {
        uniR(res, false, 'Empty input.');
    }
};

module.exports = request;