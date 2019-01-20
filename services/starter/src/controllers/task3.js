const rpcServer = require('../helpers/rpc').server;

const task = (ch) => {
    const queue = 'rpc_queue';
    rpcServer(ch, queue, (data) => {
        return new Promise((resolve, reject) => {
            console.log(data.content.toString());
            resolve('Hi');
        });
    });
};

module.exports = task;