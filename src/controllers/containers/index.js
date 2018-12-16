const rfr = require('rfr');

const methods = {
    main: rfr('src/controllers/containers/main'),
    stats: rfr('src/controllers/containers/stats'),
    create: rfr('src/controllers/containers/create'),
    delete: rfr('src/controllers/containers/delete'),
    restart: rfr('src/controllers/containers/restart'),
    start: rfr('src/controllers/containers/start'),
    stop: rfr('src/controllers/containers/stop'),
    pull: rfr('src/controllers/containers/pull'),
    sftp: rfr('src/controllers/containers/sftp'),
    sftpReset: rfr('src/controllers/containers/sftpReset'),
    setDns: rfr('src/controllers/containers/setDns'),
    setGit: rfr('src/controllers/containers/setGit'),
};

module.exports = methods;