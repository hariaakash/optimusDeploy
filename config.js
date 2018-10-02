const Config = {
	'web': {
		'ip': '127.0.0.1',
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
		'ip': '52.43.8.9',
		'zoneId': '8a755526d007650c44da46dfd2926709',
		'apiKey': 'aec14d0f6ac75c489d4ad3eea00135fb6f56a',
	},
};

module.exports = Config;