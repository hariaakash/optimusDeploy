// const rfr = require('rfr');

const Dockerode = require('dockerode');

const docker = new Dockerode();

const createContainer = (data, next) => {
    docker.createContainer({
            name: data.name,
            Image: `hariaakash/op-${data.stack}`,
            PortBindings: {
                '8080/tcp': [{
                    HostPort: '80'
                }]
            }
        })
        .then((container) => {
            docker.getContainer(container.id).start();
            next(null, data.name);
        })
        .catch((error) => {
            next(error);
        });
};

const container = {
    createContainer,
};

module.exports = container;