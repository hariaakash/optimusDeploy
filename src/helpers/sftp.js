const rfr = require('rfr');
const mustache = require('mustache');
const Process = require('child_process');

const config = rfr('config');

const ensureGroup = (next) => {
    Process.exec(`grep -q sftp /etc/group`, (err) => {
        if (err) {
            Process.exec(`groupadd sftp && ${config.cmd.sftp.permitRoot} && ${config.cmd.sftp.enableGroup}`, (err) => {
                if (err) next(err, 'Error adding SFTP group.');
                else next(null, 'SFTP group created.');
            });
        } else {
            next(null, 'SFTP Group exists.');
        }
    });
};

const addUser = (data, next) => {
    Process.exec(mustache.render(config.cmd.sftp.addUser, {
        name: data.name,
        pass: data.pass,
    }), (err) => {
        if (err) next(err, 'Error creating SFTP user.');
        else next(null, 'SFTP User created.');
    });
};

const delUser = (data, next) => {
    Process.exec(`userdel ${data}`, (err) => {
        if (err) next(err, 'Error deleting SFTP user.');
        else next(null, 'SFTP user deleted.');
    });
};

const resetUserPass = (data, next) => {
    Process.exec(mustache.render(config.cmd.sftp.resetUserPass, {
        name: data.name,
        pass: data.pass,
    }), (err) => {
        if (err) next(err, 'Error resetting SFTP password.');
        else next(null, 'SFTP password reset.');
    });
};

const sftp = {
    ensureGroup,
    addUser,
    delUser,
    resetUserPass,
};

module.exports = sftp;