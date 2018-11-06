const Dockerode = require('dockerode');

const docker = new Dockerode();

const createContainer = (data, next) => {
    docker.createContainer({
            name: data.name,
            Image: `hariaakash/op-${data.stack}`,
            Env: [],
            HostConfig: {
                Binds: [`/srv/daemon-data/${data.name}:/app`],
                PortBindings: {
                    '8080/tcp': [{
                        HostPort: ''
                    }]
                },
                Memory: (256 * 1000 * 1000),
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
    docker.getContainer(data).inspect()
        .then((container) => {
            next(null, container.NetworkSettings.Ports['8080/tcp'][0].HostPort);
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
            let cpuDelta = container.cpu_stats.cpu_usage.total_usage - container.precpu_stats.cpu_usage.total_usage,
                systemDelta = container.cpu_stats.system_cpu_usage - container.precpu_stats.system_cpu_usage,
                cpu = (cpuDelta / systemDelta * 100) / container.cpu_stats.online_cpus,
                ram = container.memory_stats.usage / container.memory_stats.limit * 100,
                data = {
                    ram: ram.toFixed(2) || -1,
                    cpu: cpu >= 0 ? cpu.toFixed(2) : -1,
                };
            next(null, data);
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