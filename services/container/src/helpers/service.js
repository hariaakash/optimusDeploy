const Dockerode = require('dockerode');

const Docker = new Dockerode();

const Error = require('./utils').StatusCodeError;

const dir = process.env.DATA_DIR || '/srv/daemon-data';

const globalConfig = {
	TaskTemplate: {
		RestartPolicy: { Condition: 'on-failure', Delay: 5000000000, MaxAttempts: 5 },
		Placement: { Constraints: ['node.role == manager'] },
	},
	Mode: {
		Replicated: {
			Replicas: 1,
		},
	},
};

const create = ({ Name, Labels, Image, projectId, serviceId, Networks, next }) =>
	Docker.createService({
		Name,
		Labels,
		Networks,
		TaskTemplate: {
			ContainerSpec: {
				Image,
				Mounts: [
					{ Type: 'bind', Source: `${dir}/${projectId}/${serviceId}`, Target: '/app' },
				],
			},
			...globalConfig.TaskTemplate,
		},
		Mode: globalConfig.Mode,
	})
		.then((service) => next(null, service.id))
		.catch((err) =>
			err.statusCode ? next(err) : next(new Error('Service creation failed.', 500, err))
		);

const remove = ({ name, next }) =>
	Docker.getService(name)
		.remove()
		.then((data) => next(null, data))
		.catch(next);

const Service = { create, remove };

module.exports = Service;
