const app = require('express')();
const server = require('http').createServer(app);
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');

const port = process.env.API_PORT || 3000;

const Routes = require('./routes');
const conn = require('./helpers/amqp');

let channel = null;
conn((ch) => {
	channel = ch;
});

app.use(morgan('dev'));
app.use(cors());
app.use(
	bodyParser.urlencoded({
		extended: false,
	})
);
app.use(bodyParser.json());
app.use(requestIp.mw());

app.use((req, res, next) => {
	req.ch = channel;
	next();
});
app.use(Routes);

server.listen(port);
console.log(`Express: Running on port: ${port}`);
