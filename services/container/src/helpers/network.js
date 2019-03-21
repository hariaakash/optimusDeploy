const Dockerode = require('dockerode');

const Docker = new Dockerode();

const Error = require('./utils').StatusCodeError;

const find = ({ id = false, name, next }) => {
	const filters = { id: {}, name: {}, driver: { overlay: true } };
	if (id) filters.id[`${name}`] = true;
	else filters.name[`${name}`] = true;
	Docker.listNetworks({ filters })
		.then((nets) => (nets[0] ? next(null, nets[0]) : next(new Error('Network not found', 404))))
		.catch(next);
};

const create = ({ name: Name, Driver = 'overlay', next }) =>
	Docker.createNetwork({ Name, Driver, Attachable: true })
		.then((network) => next(null, network.id))
		.catch(next);

const remove = ({ name, next }) =>
	Docker.getNetwork(name)
		.remove()
		.then((data) => next(null, data))
		.catch(next);

const Network = {
	find,
	create,
	remove,
};

module.exports = Network;
