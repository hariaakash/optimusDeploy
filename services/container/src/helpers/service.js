const Dockerode = require('dockerode');

const Docker = new Dockerode();

const Network = require('./network');
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

const update = async ({ name: Name, type, data = {}, next }) => {
	try {
		const service = Docker.getService(Name);
		let opts = await service.inspect();
		opts = { Name, version: opts.Version.Index, ...opts.Spec };
		if (type.includes('scale')) {
			if (type === 'scaleup') opts.Mode.Replicated.Replicas += 1;
			else if (type === 'scaledown') opts.Mode.Replicated.Replicas -= 1;
		} else if (type.includes('network')) {
			if (type === 'networkAttach') {
				opts.Networks.push({ Target: data.network });
				opts.TaskTemplate.Networks = opts.Networks;
			} else if (type === 'networkDetach') {
				opts.TaskTemplate.Networks = data.Networks;
			}
		}
		const res = await service.update(opts);
		next(null, res);
	} catch (err) {
		if (err.statusCode) next(err);
		else next(new Error('Unable to update service', 500, err));
	}
};

const remove = ({ name, next }) =>
	Docker.getService(name)
		.remove()
		.then((data) => next(null, data))
		.catch(next);

const Service = { create, update, remove };

module.exports = Service;
