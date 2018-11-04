const Process = require('child_process');

const clone = (data, next) => {
    Process.exec(`cd /srv/daemon-data/${data.name}; git clone ${data.git} .`, (err) => {
        if (err) {
            next(err, 'Unable to git clone.');
        } else {
            next(null, 'Git cloned.');
        }
    });
};
const pull = (data, next) => {
    Process.exec(`cd /srv/daemon-data/${data}; git pull`, (err) => {
        if (err) {
            next(err, 'Unable to git pull.');
        } else {
            next(null, 'Git pull completed.');
        }
    });
};

const git = {
    clone,
    pull,
};

module.exports = git;