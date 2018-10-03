const rfr = require('rfr');
const axios = require('axios');

const config = rfr('config');

const createDns = (uri, next) => {
    axios({
            url: `https://api.cloudflare.com/client/v4/zones/${config.cloudflare.zoneId}/dns_records`,
            method: 'POST',
            headers: {
                'X-Auth-Email': config.cloudflare.email,
                'X-Auth-Key': config.cloudflare.apiKey,
                'Content-Type': 'application/json',
            },
            data: {
                type: 'A',
                name: uri,
                content: config.cloudflare.ip,
                proxied: true,
            },
        })
        .then((response) => {
            if (response.data.success) {
                next(null, 'DNS created successfully.');
            } else {
                next(response.data.errors, 'DNS creation failed.');
            }
        })
        .catch((error) => {
            next(error);
        });
};

const checkDns = (uri, next) => {
    axios({
            url: `https://api.cloudflare.com/client/v4/zones/${config.cloudflare.zoneId}/dns_records`,
            method: 'GET',
            headers: {
                'X-Auth-Email': config.cloudflare.email,
                'X-Auth-Key': config.cloudflare.apiKey,
                'Content-Type': 'application/json',
            },
            data: {
                type: 'A',
                name: `${uri}.${config.cloudflare.domain}`,
            },
        })
        .then((response) => {
            if (response.data.result.length > 0) {
                next(null, response.data.result[0].id);
            } else {
                next(null, false);
            }
        })
        .catch((error) => {
            next(error);
        });
};

const deleteDns = (uri, next) => {
    axios({
            url: `https://api.cloudflare.com/client/v4/zones/${config.cloudflare.zoneId}/dns_records/${uri}`,
            method: 'DELETE',
            headers: {
                'X-Auth-Email': config.cloudflare.email,
                'X-Auth-Key': config.cloudflare.apiKey,
                'Content-Type': 'application/json',
            },
        })
        .then((response) => {
            if (response.data.success) {
                next(null, 'DNS removed.');
            } else {
                next(null, false);
            }
        })
        .catch((error) => {
            next(error);
        });
};

const cloudflare = {
    checkDns,
    createDns,
    deleteDns,
};

module.exports = cloudflare;