const rfr = require('rfr');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');

const core = rfr('core');
const log = rfr('helpers/logger');
// const config = rfr('helpers/config');

server.listen(core.web.listen, core.web.host);
log.info('Server Started');
