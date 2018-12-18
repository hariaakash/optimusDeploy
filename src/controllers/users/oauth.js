const rfr = require('rfr');

const uniR = rfr('src/helpers/uniR');

const Oauth = rfr('src/helpers/oauth');

const request = (req, res) => {
    if (req.body.social && req.body.code) {
        switch (req.body.social) {
            case 'google':
                Oauth.google(req.body.code, req.clientIp)
                    .then((response) => {
                        res.json(response);
                    })
                    .catch(() => uniR(res, false, 'Token expired or invalid request.'));
                break;
            case 'github':
                Oauth.github(req.body.code, req.clientIp)
                    .then((response) => {
                        res.json({
                            status: true,
                            msg: 'qq'
                        });
                    })
                    .catch(() => uniR(res, false, 'Token expired or invalid request.'));
                break;
            default:
                uniR(res, false, 'Empty input.');
        }
    } else {
        uniR(res, false, 'Empty input.');
    }
};

module.exports = request;