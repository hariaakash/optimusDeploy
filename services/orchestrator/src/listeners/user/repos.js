const apm = require('elastic-apm-node');
const async = require('async');

const { rpcSend, rpcConsume } = require('../../helpers/amqp-wrapper');

const processData = ({ authKey, source }, ch) =>
	new Promise((resolve) => {
		const reposTrans = apm.startTransaction('Orchestration: User: GithubRepos');
		async.auto(
			{
				checkAuth: [
					(cb) => {
						const checkSpan = reposTrans.startSpan(
							'AMQP Call: user_profile:main_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_profile:main_orchestrator',
							data: { authKey },
						})
							.then((res) => {
								if (res.status === 200) cb(null, res.data);
								else if ([401, 404].includes(res.status)) cb('checkAuth', res);
								else cb('checkAuth');
							})
							.then(() => {
								if (checkSpan) {
									checkSpan.end();
								}
							});
					},
				],
				getRepos: [
					'checkAuth',
					(results, cb) => {
						const getSpan = reposTrans.startSpan(
							'AMQP Call: user_profile:repos_orchestrator'
						);
						rpcSend({
							ch,
							queue: 'user_profile:repos_orchestrator',
							data: { _id: results.checkAuth._id, source },
						})
							.then((res) => {
								if ([200, 404].includes(res.status)) cb(null, res);
								else cb('getRepos');
							})
							.then(() => {
								if (getSpan) {
									getSpan.end();
								}
							});
					},
				],
			},
			(err, result) => {
				if (err) {
					if (['checkAuth', 'getRepos'].includes(err) && !!result[err])
						resolve(result[err]);
					else resolve({ status: 500, data: { msg: 'Internal Server Error' } });
					if (reposTrans) {
						reposTrans.end();
					}
				} else {
					resolve(result.getRepos);
					if (reposTrans) {
						reposTrans.end();
					}
				}
			}
		);
	});

const method = (ch) => {
	rpcConsume({ ch, queue: 'orchestrator_user:repos_api', process: processData });
};

module.exports = method;
