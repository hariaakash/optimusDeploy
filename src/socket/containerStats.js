const rfr = require('rfr');
const _ = require('lodash');
const Dockerode = require('dockerode');

const docker = new Dockerode();

const formatStats = rfr('src/helpers/formatStats');

const containerStats = (data, client) => {
    if (client.data.user.containers.findIndex(x => x._id == data) > -1) {
        docker.getContainer(data).stats({
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