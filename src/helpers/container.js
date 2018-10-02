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
            next(error, 'DNS creation failed.');
        });
};

// Incomplete - data = containerId
const deleteContainer = (data, next) => {
    docker.getContainer(data).remove({
            id: data,
            v: true,
            force: true,
            link: true
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });
};

const container = {
    createContainer,
    deleteContainer,
};

module.exports = container;