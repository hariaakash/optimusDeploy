const rfr = require('rfr');
const Dockerode = require('dockerode');

const docker = new Dockerode();

const formatStats = rfr('src/helpers/formatStats');

const createContainer = (data, next) => {
    const DEPLOY_PORT = 80;
    switch (data.stack) {
        case 'node':
        case 'flask':
            DEPLOY_PORT = 8080;
            break;
        default:
            break;
    }
    docker.createContainer({
            name: data.name,
            Image: `hariaakash/op-${data.stack}`,
            Env: [`DEPLOY_PORT=${DEPLOY_PORT}`, "DEPLOY_IP=0.0.0.0"],
            HostConfig: {
                Binds: [`/srv/daemon-data/${data.name}/app:/app`],
                PortBindings: {
                    '80/tcp': [{
                        HostPort: ''
                    }]
                },
                Memory: (256 * 1000 * 1000),
                MemoryReservation: (256 * 1000 * 1000),
            },
        })
        .then((container) => {
            next(null, container.id);
        })
        .catch((error) => {
            next(error, 'DNS creation failed.');
        });
};

const deleteContainer = (data, next) => {
    docker.getContainer(data).remove({
            force: true
        })
        .then(() => {
            next(null);
        })
        .catch((err) => {
            next(err, 'Container unable to remove.');
        });
};

const restartContainer = (data, next) => {
    docker.getContainer(data).restart()
        .then((container) => {
            next(null, data);
        })
        .catch((err) => {
            next(err, 'Container unable to restart.');
        });
};

const startContainer = (data, next) => {
    docker.getContainer(data).start()
        .then((container) => {
            next(null, data);
        })
        .catch((err) => {
            if (err.statusCode == 304) next(null, 'Container is already running.')
            else next(err, 'Container unable to start.');
        });
};

const stopContainer = (data, next) => {
    docker.getContainer(data).stop()
        .then((container) => {
            next(null, 'Container stopped successfully.');
        })
        .catch((err) => {
            if (err.statusCode == 304) next(null, 'Container already in stopped state.')
            else next(err, 'Container unable to stop.');
        });
};

const inspectPort = (data, next) => {
    docker.getContainer(data.id).inspect()
        .then((container) => {
            const DEPLOY_PORT = 80;
            switch (data.stack) {
                case 'node':
                case 'flask':
                    DEPLOY_PORT = 8080;
                    break;
                default:
                    break;
            }
            next(null, container.NetworkSettings.Ports[`${DEPLOY_PORT}/tcp`][0].HostPort);
        })
        .catch((err) => {
            next(err, 'Unable to retrieve port.');
        });
};

const containerStats = (data, next) => {
    docker.getContainer(data).stats({
            stream: false
        })
        .then((container) => {
            next(null, formatStats(container));
        })
        .catch((err) => {
            next(err, 'Unable to retrieve stats.');
        });
};

const container = {
    createContainer,
    deleteContainer,
    restartContainer,
    startContainer,
    stopContainer,
    inspectPort,
    containerStats,
};

module.exports = container;