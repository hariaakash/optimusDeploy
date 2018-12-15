const rfr = require('rfr');
const Dockerode = require('dockerode');
const stream = require('stream');

const docker = new Dockerode();

const Log = rfr('src/helpers/logger');

const containerLogs = (data, client) => {

    // create a single stream for stdin and stdout
    const logStream = new stream.PassThrough();
    logStream.on('data', (log) => {
        client.data.containerLogs = true;
        client.data.containerLogsStream = logStream;
        client.emit('containerLogs', log.toString('utf8'));
    });
    logStream.on('error', (error) => {});

    if (data.status == 'start') {
        if ((x = client.data.user.containers.findIndex(y => y._id == data.containerId)) > -1) {
            docker.getContainer(client.data.user.containers[x].containerId).logs({
                follow: true,
                stdout: true,
                stderr: true,
                tail: "20",
            }, (err, stream) => {
                if (err) Log.error(err);
                else {
                    docker.getContainer(data.containerId).modem.demuxStream(stream, logStream, logStream);
                };
            });
        }
    } else if (data.status == 'stop') {
        if (client.data.containerLogs) client.data.containerLogsStream.destroy();
    }
};

module.exports = containerLogs;