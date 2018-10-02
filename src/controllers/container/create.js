const rfr = require('rfr');
const async = require('async');

const Docker = rfr('src/helpers/container');
const Dns = rfr('src/helpers/dns');
const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const request = (req, res) => {
    if (req.body.name && req.body.stack && req.body.git) {
        async.auto({
            retrieveContainer: [(callback) => {
                Dns.checkDns(req.body, callback);
            }],
            checkContainer: ['retrieveContainer', (result, callback) => {
                if (result.retrieveContainer) {
                    callback({
                        dnsId: result.retrieveContainer
                    }, 'Existing DNS found');
                } else {
                    callback(null, 'DNS not found.');
                }
            }],
            createContainer: ['checkContainer', (result, callback) => {
                Docker.createContainer(req.body, callback);
            }],
            createDNS: ['createContainer', (result, callback) => {
                Dns.createDns(result.createContainer, callback);
            }],
        }, (err, result) => {
            if (err) {
                Log.error(err);
                uniR(res, false, 'A fatal error caused the creation of container to abort.');
            } else {
                Log.info(`Container created with name: ${result.createContainer}`);
                uniR(res, true, 'Container Created successfully.');
            }
        });
    } else {
        uniR(res, false, 'Entries missing.');
    }
};

module.exports = request;