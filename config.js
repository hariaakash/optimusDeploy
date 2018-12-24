const Config = {
	'web': {
		'host': '0.0.0.0',
		'port': 8080,
	},
	'mongoose': {
		'host': '127.0.0.1',
		'port': 27017,
		'db': 'opdptest',
	},
	'mysql': {
		'host': '127.0.0.1',
		'user': 'root',
		'password': '12345678',
		'connectionLimit': 100,
	},
	'mongooseSlave': {
		'host': '0.0.0.0',
		'port': 37017,
		'user': 'root',
		'password': '12345678',
	},
	'logger': {
		'path': 'logs/',
		'src': false,
		'period': '1d',
		'count': 10,
	},
	'cors': {
		'whitelist': ['https://optimuscp.io', 'https://sftp.optimuscp.io', 'http://127.0.0.1:8000', 'http://localhost:8000', 'http://hax4lyf:8000']
	},
	'oauth': {
		'google': {
			'client_id': '666163516742-b89cg46pnk6o8p75b9btgp7o03gvv081.apps.googleusercontent.com',
			'client_secret': 'OzxCxTGs8PJedpi4y1VeqdRH',
			'redirect_uri': 'https://optimuscp.io/oauth.html',
			'grant_type': 'authorization_code',
			'tokenUrl': 'https://www.googleapis.com/oauth2/v4/token',
			'userInfoUrl': 'https://www.googleapis.com/oauth2/v2/userinfo',
		},
		'github': {
			'client_id': '129800c9747092aabe46',
			'client_secret': '267225d33106584503b84551d493e77bbdd7b0b8',
			'tokenUrl': 'https://github.com/login/oauth/access_token',
			'userInfoUrl': 'https://api.github.com/user',
		},
	},
	'cloudflare': {
		'email': 'smgdark@gmail.com',
		'domain': 'gameservers.ooo',
		'ip': '78.46.21.224',
		'zoneId': '8a755526d007650c44da46dfd2926709',
		'apiKey': 'aec14d0f6ac75c489d4ad3eea00135fb6f56a',
	},
	'sendgrid': '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',
	'directories': ['/srv/daemon-data/'],
	'dashboard': {
		'user': 'https://optimuscp.io/dashboard/#!/',
		'admin': 'https://optimuscp.io/admin/#!/',
	},
	'cmd': {
		'certbot': {
			'create': 'certbot certonly -a webroot --webroot-path=/srv/daemon-data/{{id}}/tmp -d {{domain}} --cert-name {{id}} --email {{email}} -n --agree-tos',
		},
		'git': {
			'clone': 'cd /srv/daemon-data/{{name}}/app/ && rm -rf * && GIT_SSH_COMMAND="ssh -i /srv/daemon-data/{{name}}/tmp/{{name}}" git clone {{{repo}}} . && chown -R {{name}}:sftp /srv/daemon-data/{{name}}/app',
			'pull': 'cd /srv/daemon-data/{{data}}/app/ && git reset --hard && GIT_SSH_COMMAND="ssh -i /srv/daemon-data/{{data}}/tmp/{{data}}" git pull'
		},
		'sftp': {
			'permitRoot': 'chown root:root /srv/daemon-data && chmod 751 /srv/daemon-data',
			'enableGroup': 'echo "Match Group sftp \n\
		ChrootDirectory /srv/daemon-data/%u \n\
		ForceCommand internal-sftp \n\
		PermitTunnel no \n\
		AllowAgentForwarding no \n\
		AllowTcpForwarding no \n\
		X11Forwarding no" >> /etc/ssh/sshd_config && \
						service sshd restart',
			'addUser': 'useradd {{name}} -M -g sftp -p $(openssl passwd -1 {{pass}}) -d /srv/daemon-data/{{name}} -s /bin/false',
			'resetUserPass': 'usermod {{name}} -p $(openssl passwd -1 {{pass}})',
			'createVolume': 'mkdir -p /srv/daemon-data/{{name}} && \
						chown root:sftp /srv/daemon-data/{{name}} && \
						chmod 751 /srv/daemon-data/{{name}} && \
						mkdir -p /srv/daemon-data/{{name}}/app /srv/daemon-data/{{name}}/tmp && \
						chown {{name}}:sftp /srv/daemon-data/{{name}}/app && \
						chmod 755 /srv/daemon-data/{{name}}/app',
		},
	},
};

module.exports = Config;