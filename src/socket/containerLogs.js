const Dockerode = require('dockerode');

const docker = new Dockerode();

const containerLogs = (data, client) => {
    if (data) {
        docker.getContainer(data).logs({
            follow: true
        }, (err, stream) => {
            if (err) console.log(err);
            else {
                stream.setEncoding('utf8');
                stream.on('data', (log) => {
                    client.emit('containerStats', log);
                });
            };
        });
    }
};

module.exports = containerLogs;