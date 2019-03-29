const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, source }, ch) =>
	new Promise((resolve) => {
		async.auto(
			{
				checkAuth: [
					(cb) => {
						rpcSend({
							ch,
							queue: 'user_profile:main_orchestrator',
							data: { authKey },
						}).then((res) => {
							if (res.status === 200) cb(null, res.data);
							else if ([401, 404].includes(res.status)) cb('checkAuth', res);
							else cb('checkAuth');
						});
					},
				],
				getRepos: [
					'checkAuth',
					(results, cb) => {
						rpcSend({
							ch,
							queue: 'user_profile:repos_orchestrator',
							data: { _id: results.checkAuth._id, source },
						}).then((res) => (res.status === 200 ? cb(null, res) : cb('getRepos')));
					},
				],
			},
			(err, result) => {
				if (err) {
					if (['checkAuth', 'getRepos'].includes(err) && !!result[err])
						resolve(result[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
				} else resolve(result.getRepos);
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:repos_api', process: processData });
};

module.exports = method;
