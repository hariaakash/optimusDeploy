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

const create = ({ name, next }) =>
	Docker.createNetwork({ Name: name, Driver: 'overlay' })
		.then((network) => next(null, network))
		.catch(next);

const remove = ({ id, next }) =>
	Docker.getNetwork(id)
		.remove()
		.then((data) => next(null, data))
		.catch(next);

const Network = {
	find,
	create,
	remove,
};

module.exports = Network;
