const rfr = require('rfr');
const axios = require('axios');

const config = rfr('config');

const createDNS = (uri, next) => {
    axios({
            url: `https://api.cloudflare.com/client/v4/zones/${config.cloudflare.zoneId}/dns_records`,
            method: 'POST',
            headers: {
                'X-Auth-Email': 'smgdark@gmail.com',
                'X-Auth-Key': config.cloudflare.apiKey,
                'Content-Type': 'application/json',
            },
            data: {
                type: 'A',
                name: `${uri}.${config.cloudflare.domain}`,
                content: '52.43.8.9',
                proxied: true,
            },
        })
        .then((response) => {
            next(null, response.data.success);
        })
        .catch((error) => {
            next(error);
        });
};

const cloudflare = {
    createDNS,
};

module.exports = cloudflare;