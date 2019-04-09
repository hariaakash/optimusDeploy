const Dockerode = require('dockerode');

const Error = require('./utils').StatusCodeError;

const Docker = new Dockerode();

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
		} else if (type === 'network') {
			opts.Networks = data.Networks;
			opts.TaskTemplate.Networks = opts.Networks;
		} else if (type === 'volume') {
			data.Mounts.forEach((x) => {
				x.Source = `${dir}/${x.Source}`;
				x.Target = x.Target === 'app' ? '/app' : `/mnt/${x.Target}`;
			});
			opts.TaskTemplate.ContainerSpec.Mounts = data.Mounts;
		} else if (type === 'enablePublic') {
			opts.Labels['traefik.enable'] = `${data.enablePublic}`;
		} else if (type === 'domain') {
			opts.Labels['traefik.frontend.rule'] = `Host:${data.domain}`;
		} else if (type === 'port') {
			opts.Labels['traefik.port'] = `${data.port}`;
		} else if (type === 'stop') {
			opts.Mode.Replicated.Replicas = 0;
		} else if (type === 'start') {
			if (opts.Mode.Replicated.Replicas === 0) opts.Mode.Replicated.Replicas = 1;
		} else if (type === 'restart') {
			opts.Mode.Replicated.Replicas = 0;
			await service.update(opts);
			update({ name: Name, type: 'start', next });
		}
		if (type !== 'restart') {
			const res = await service.update(opts);
			next(null, res);
		}
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
