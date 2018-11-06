const Config = {
	'web': {
		'ip': '0.0.0.0',
		'port': 8080,
	},
	'mongoose': {
		'ip': '127.0.0.1',
		'port': 27017,
		'db': 'opdptest',
	},
	'logger': {
		'path': 'logs/',
		'src': false,
		'period': '1d',
		'count': 10,
	},
	'cloudflare': {
		'email': 'smgdark@gmail.com',
		'domain': 'gameservers.ooo',
		'ip': '13.233.94.34',
		'zoneId': '8a755526d007650c44da46dfd2926709',
		'apiKey': 'aec14d0f6ac75c489d4ad3eea00135fb6f56a',
	},
	'sendgrid': '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',
	'directories': ['/srv/daemon-data/', '/srv/keys'],
	'dashboard': {
		'user': 'https://optimuscp.io/dashboard/#!/',
		'admin': 'https://optimuscp.io/admin/#!/',
	},
};

module.exports = Config;