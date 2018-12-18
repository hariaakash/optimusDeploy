const rfr = require('rfr');
const axios = require('axios');
const hat = require('hat');

const config = rfr('config');

const User = rfr('src/models/users');

const handleUser = (data, resolve, reject) => {
    User.findOne({
            email: data.userInfo.email
        })
        .then((user) => {
            if (user) {
                if (user.social[data.social].enabled) {
                    user.logs.push({
                        ip: data.ip,
                        msg: `Logged in using ${data.social}.`,
                    });
                    user.save();
                    resolve({
                        status: true,
                        msg: `Logged in using ${data.social}`,
                        authKey: user.authKey,
                    });
                } else {
                    user.social[data.social].enabled = true;
                    user.social[data.social].id = data.userInfo.id;
                    user.social[data.social].refresh_token = data.userAuth.refresh_token;
                    if (user.conf.verified != 'true') user.conf.verified == 'true';
                    user.logs.push({
                        ip: data.ip,
                        msg: `Social login using ${data.social} enabled.`,
                    });
                    user.save();
                    resolve({
                        status: true,
                        msg: `Social login using ${data.social} enabled.`,
                        authKey: user.authKey,
                    });
                }
            } else {
                var newUser = new User();
                newUser.email = data.userInfo.email;
                newUser.social[data.social].enabled = true;
                newUser.social[data.social].id = data.userInfo.id;
                newUser.social[data.social].refresh_token = data.userAuth.refresh_token;
                newUser.conf.verified = 'true';
                newUser.conf.setPassword = false;
                newUser.conf.pToken = hat();
                newUser.authKey = hat();
                newUser.logs.push({
                    ip: data.ip,
                    msg: `Registered using ${data.social}.`,
                });
                newUser.save();
                resolve({
                    status: true,
                    msg: `Registered using ${data.social}.`,
                    authKey: newUser.authKey,
                });
            }
        })
        .catch((err) => reject(err));
};

const github = (code, ip) => {
    var data = {
        ip,
    };
    return new Promise((resolve, reject) => {
        axios({
                method: 'POST',
                url: config.oauth.github.tokenUrl,
                headers: {
                    Accept: 'application/json',
                },
                data: {
                    code,
                    client_id: config.oauth.github.client_id,
                    client_secret: config.oauth.github.client_secret,
                },
            })
            .then((response) => {
                data.userAuth = response.data;
                return axios({
                    method: 'GET',
                    url: config.oauth.github.userInfoUrl,
                    headers: {
                        Authorization: `token ${response.data.access_token}`,
                        Accept: 'application/json',
                    },
                });
            })
            .then((response) => {
                data.userInfo = response.data;
                data.social = 'github';
                handleUser(data, resolve, reject);
            })
            .catch((err) => reject(err));
    });
};

const google = (code, ip) => {
    var data = {
        ip,
    };
    return new Promise((resolve, reject) => {
        axios({
                method: 'POST',
                url: config.oauth.google.tokenUrl,
                data: {
                    code,
                    client_id: config.oauth.google.client_id,
                    client_secret: config.oauth.google.client_secret,
                    redirect_uri: config.oauth.google.redirect_uri,
                    grant_type: config.oauth.google.grant_type,
                },
            })
            .then((response) => {
                data.userAuth = response.data;
                return axios({
                    method: 'GET',
                    url: config.oauth.google.userInfoUrl,
                    headers: {
                        Authorization: `${response.data.token_type} ${response.data.access_token}`,
                    },
                });
            })
            .then((response) => {
                data.userInfo = response.data;
                data.social = 'google';
                handleUser(data, resolve, reject);
            })
            .catch((err) => reject(err));
    });
};

const oauth = {
    google,
    github,
};

module.exports = oauth;