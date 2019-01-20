const uuid = require('uuid');

const task = (ch) => {

    const channel = 'rpcTask';

    // var ok = ch.assertQueue('', {exclusive: true})
    //     .then((qok) => { console.log(qok.queue);return qok.queue; });

    //   ok = ok.then((queue)=> {
    //     return ch.consume(queue, (data) => {
    //         console.log(data.content.toString());
    //     })
    //       .then(() => queue);
    //   });

    //   ok = ok.then((queue) => {
    //     ch.sendToQueue(channel, Buffer.from('something totally new to do'), {
    //       correlationId: corrId, replyTo: queue
    //     });
    //   });
};

module.exports = task;