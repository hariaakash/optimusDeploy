const Dockerode = require('dockerode');

const Docker = new Dockerode();

const Error = require('./utils').StatusCodeError;

const build = ({ dir, id, next }) => {
	Docker.buildImage(
		{ context: dir, src: ['Dockerfile', 'entrypoint.sh', 'src'] },
		{ t: `${id}:latest` },
		(error, stream) => {
			if (error) next(error);
			else
				Docker.modem.followProgress(stream, (err, res) => {
					if (err) next(new Error('Some Error occurred', 500));
					else next(null, { image: id });
				});
		}
	);
};

const Image = { build };

module.exports = Image;
