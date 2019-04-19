const { Client } = require('@elastic/elasticsearch');

const ELASTICSEARCH_URI = process.env.ELASTICSEARCH_URI || 'http://elasticsearch:9200';

const client = new Client({ node: ELASTICSEARCH_URI });

const logs = ({ name }) =>
	new Promise((resolve, reject) => {
		client
			.search({
				index: 'filebeat*',
				format: 'json',
				body: {
					size: '100',
					query: {
						multi_match: {
							query: name,
							fields: ['*name'],
						},
					},
					_source: ['@timestamp', 'message', 'stream'],
					sort: [
						{
							'@timestamp': {
								order: 'desc',
							},
						},
					],
				},
			})
			.then(({ body }) => resolve(body.hits.hits.map(({ _source }) => _source)))
			.catch((err) => reject(err.body.error));
	});

// logs({ name: 'services_analyzer' }).then((data) => {
// 	data.forEach((x) => {
// 		if (x.message.indexOf('qq') > -1) console.log(1);
// 	});
// });

module.exports = {};
