const rpcClient = require('../helpers/rpc').client;

const task = (ch) => {
    const queue = 'rpc_queue';
    rpcClient(ch, queue, 'Hello')
        .then((data) => console.log(data.content.toString()));
};

module.exports = task;