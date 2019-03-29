const apm = require('elastic-apm-node').start();

const app = require('express')();
const server = require('http').createServer(app);
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');

const port = process.env.API_PORT || 3000;

const expressCustomMW = require('./helpers/expressCustomMW');
const Routes = require('./routes');
const conn = require('./helpers/amqp');

let channel = null;
conn((ch) => {
	channel = ch;
});

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressCustomMW.bodyParserErrorHandler);
app.use(requestIp.mw());
app.use((req, res, next) => expressCustomMW.setChannel(req, res, next, channel));
app.use(Routes);

server.listen(port);
console.log(`Express: Running on port: ${port}`);
