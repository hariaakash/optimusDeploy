const rfr = require('rfr');
const map = require('lodash/map');
const replace = require('lodash/replace');
const Dockerode = require('dockerode');

const Log = rfr('src/helpers/logger');
const uniR = rfr('src/helpers/uniR');

const docker = new Dockerode();

const request = (req, res) => {
    docker.listContainers({
            all: true
        })
        .then((containers) => {
            if (containers.length > 0) {
                res.json({
                    status: true,
                    msg: 'Fetched successfully.',
                    containers: map(containers, x => ({
                        id: x.Id.substring(0, 12),
                        image: x.Image,
                        state: x.State,
                        status: x.Status,
                        name: replace(x.Names[0], '/', '')
                    }))
                });
            } else {
                uniR(res, false, 'No containers found');
            }
        })
        .catch((err) => {
            Log.error(err);
            uniR(res, false, 'Some error occurred.');
        });
};

module.exports = request;