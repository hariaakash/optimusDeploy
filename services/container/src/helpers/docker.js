const Dockerode = require('dockerode');

const docker = new Dockerode();

const createContainer = (data, next) => {
	const { name, Image, Memory = 256 * 1000 * 1000, MemoryReservation = 256 * 1000 * 1000 } = data;
	docker
		.createContainer({
			name,
			Image,
			Env: ['DEPLOY_PORT=8080', 'DEPLOY_IP=0.0.0.0'],
			HostConfig: {
				PortBindings: {
					'8080/tcp': [
						{
							HostPort: '',
						},
					],
				},
				Memory,
				MemoryReservation,
			},
		})
		.then((container) => {
			next(null, container.id);
		})
		.catch((error) => {
			next(error, 'Container creation failed.');
		});
};

const deleteContainer = ({ id }, next) => {
	docker
		.getContainer(id)
		.remove({
			force: true,
		})
		.then(() => {
			next(null);
		})
		.catch((err) => {
			next(err, 'Container unable to remove.');
		});
};

const restartContainer = ({ id }, next) => {
	docker
		.getContainer(id)
		.restart()
		.then((container) => {
			next(null, container);
		})
		.catch((err) => {
			next(err, 'Container unable to restart.');
		});
};

const startContainer = ({ id }, next) => {
	docker
		.getContainer(id)
		.start()
		.then((container) => {
			next(null, container);
		})
		.catch((err) => {
			if (err.statusCode === 304) next(null, 'Container is already running.');
			else next(err, 'Container unable to start.');
		});
};

const stopContainer = ({ id }, next) => {
	docker
		.getContainer(id)
		.stop()
		.then((container) => {
			next(null, 'Container stopped successfully.');
		})
		.catch((err) => {
			if (err.statusCode === 304) next(null, 'Container already in stopped state.');
			else next(err, 'Container unable to stop.');
		});
};

const container = {
	createContainer,
	deleteContainer,
	restartContainer,
	startContainer,
	stopContainer,
};

module.exports = container;
