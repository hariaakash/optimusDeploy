const rfr = require('rfr');
const _ = require('lodash');
const Dockerode = require('dockerode');

const docker = new Dockerode();

const Log = rfr('src/helpers/logger');
const formatStats = rfr('src/helpers/formatStats');

const containerStats = (data, client) => {
    if (data.status == 'start') {
        if ((x = client.data.user.containers.findIndex(y => y._id == data.containerId)) > -1) {
            docker.getContainer(client.data.user.containers[x].containerId).stats({
                stream: true,
            }, (err, stream) => {
                if (err) Log.error(err);
                else {
                    client.data.containerStats = true;
                    client.data.containerStatsStream = stream;
                    stream.setEncoding('utf8');
                    stream.on('data', (stats) => {
                        stats = (_.isObject(stats)) ? stats : JSON.parse(stats);
                        client.emit('containerStats', formatStats(stats));
                    });
                    stream.on('error', (error) => stream.distroy());
                };
            });
        }
    } else if (data.status == 'stop') {
        if (client.data.containerStats) client.data.containerStatsStream.destroy();
    }
};

module.exports = containerStats;