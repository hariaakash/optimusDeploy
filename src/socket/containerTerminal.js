const rfr = require('rfr');
const Dockerode = require('dockerode');
const stream = require('stream');

const docker = new Dockerode();

const Log = rfr('src/helpers/logger');

const containerLogs = (data, client) => {

    // create a single stream for stdin and stdout
    const logStream = new stream.PassThrough();
    logStream.on('data', (log) => client.emit('containerTerminal', log.toString('utf8')))
        .on('error', () => logStream.destroy());

    if ((x = client.data.user.containers.findIndex(y => y._id == data.containerId)) > -1) {
        docker.getContainer(client.data.user.containers[x].containerId).exec({
            Cmd: ['sh', '-c', data.cmd],
            AttachStdout: true,
            AttachStderr: true,
        }, (err, stream) => {
            if (err) Log.error(err);
            else docker.getContainer(data.containerId).modem.demuxStream(stream, logStream, logStream);
        });
    }
};