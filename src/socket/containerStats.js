const rfr = require('rfr');
const _ = require('lodash');
const Dockerode = require('dockerode');

const docker = new Dockerode();

const formatStats = rfr('src/helpers/formatStats');

const containerStats = (data, client) => {
    if ((x = client.data.user.containers.findIndex(y => y._id == data)) > -1) {
        docker.getContainer(client.data.user.containers[x].containerId).stats({
            stream: true
        }, (err, stream) => {
            if (err) console.log(err);
            else {
                stream.setEncoding('utf8');
                stream.on('data', (stats) => {
                    console.log('stats');
                    stats = (_.isObject(stats)) ? stats : JSON.parse(stats);
                    client.emit('containerStats', formatStats(stats));
                });
            };
        });
    }
};

module.exports = containerStats;