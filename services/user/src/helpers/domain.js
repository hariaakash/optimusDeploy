const async = require('async');
const axios = require('axios');

const Error = require('../helpers/utils').StatusCodeError;

const { CLOUDFLARE_EMAIL, CLOUDFLARE_APIKEY } = process.env;
const { MASTER_IPS: IPS } = process.env;
const MASTER_IPS = IPS.split(',').filter((x) => x);

const CLOUDFLARE_URI = 'https://api.cloudflare.com/client/v4/zones';

const CLOUDFLARE_OPTIONS = {
	'X-Auth-Email': CLOUDFLARE_EMAIL,
	'X-Auth-Key': CLOUDFLARE_APIKEY,
	'Content-Type': 'application/json',
};

const CLOUDFLARE_DOMAINS = [{ name: 'optimuscp.io', zoneId: '34fba01d6f236851881108b21c96b9e9' }];

const create = ({ name, domain }) =>
	new Promise((resolve, reject) => {
		const domainIndex = CLOUDFLARE_DOMAINS.findIndex((x) => x.name === domain);
		if (domainIndex >= 0) {
			const url = `${CLOUDFLARE_URI}/${CLOUDFLARE_DOMAINS[domainIndex].zoneId}/dns_records`;
			name = `${name}.${domain}`;
			const domainIds = [];
			async.each(
				MASTER_IPS,
				(content, cb) => {
					axios({
						url,
						method: 'POST',
						headers: CLOUDFLARE_OPTIONS,
						data: { type: 'A', name, content, proxied: true },
					})
						.then((res) => {
							if (res.data.success) {
								domainIds.push(res.data.result.id);
								cb();
							} else cb(new Error('Some error occurred', 500, res));
						})
						.catch(cb);
				},
				(err) => {
					if (err) reject(err.response);
					else resolve({ domain: CLOUDFLARE_DOMAINS[0].name, domainIds });
				}
			);
		} else reject(new Error('Invalid domain', 403));
	});

const remove = ({ domain, domainIds }) =>
	new Promise((resolve, reject) => {
		async.each(
			domainIds,
			(domainId, cb) => {
				const domainIndex = CLOUDFLARE_DOMAINS.findIndex((x) => x.name === domain);
				const { zoneId } = CLOUDFLARE_DOMAINS[domainIndex];
				axios({
					url: `${CLOUDFLARE_URI}/${zoneId}/dns_records/${domainId}`,
					method: 'DELETE',
					headers: CLOUDFLARE_OPTIONS,
				})
					.then((res) => {
						if (res.data.success) cb(null, 'DNS removed.');
						else cb(new Error('Unable to remove', 403));
					})
					.catch(cb);
			},
			(err) => {
				if (err) reject(err);
				else resolve();
			}
		);
	});

const Domain = { domains: CLOUDFLARE_DOMAINS, create, remove };

module.exports = Domain;
