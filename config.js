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
};

module.exports = Config;
