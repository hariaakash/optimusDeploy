const { assert, send } = require('../../helpers/amqp-wrapper');

const request = (req, res) => {
	const { ch } = req;
	const queue = 'user:create';
	assert({ ch, queue });
	send({ ch, queue, data: { email: 'smgdark@gmail.com' } });
	res.json({ status: true, msg: 'hi' });
};

module.exports = request;
