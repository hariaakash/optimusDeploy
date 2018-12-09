const Dockerode = require('dockerode');

const docker = new Dockerode();

const containerLogs = (data, client) => {
    if ((x = client.data.user.containers.findIndex(y => y._id == data)) > -1) {
        docker.getContainer(client.data.user.containers[x].containerId).logs({
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