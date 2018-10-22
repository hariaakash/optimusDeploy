const Dockerode = require('dockerode');

const docker = new Dockerode();

const createContainer = (data, next) => {
    data.repo = data.git.replace('https://', '').replace('http://', '').split('/')[2];
    docker.createContainer({
            name: data.name,
            Image: `hariaakash/op-${data.stack}`,
            Env: [`GIT_URL=${data.git}`, `GIT_REPO=${data.repo}`],
            PortBindings: {
                '8080/tcp': [{
                    HostPort: ''
                }]
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

const startContainer = (data, next) => {
    docker.getContainer(data).start()
        .then(() => {
            next(null, data);
        })
        .catch((err) => {
            next(err, 'Container unable to start.');
        });
};

const stopContainer = (data, next) => {
    docker.getContainer(data).stop()
        .then(() => {
            next(null, data);
        })
        .catch((err) => {
            next(err, 'Container unable to stop.');
        });
};

const inspectPort = (data, next) => {
    docker.getContainer(data).inspect()
        .then((response) => {
            next(null, response.NetworkSettings.Ports['8080/tcp'][0].HostPort);
        })
        .catch((err) => {
            next(err, 'Unable to retrieve port.');
        });
};

const container = {
    createContainer,
    deleteContainer,
    startContainer,
    stopContainer,
    inspectPort,
};

module.exports = container;