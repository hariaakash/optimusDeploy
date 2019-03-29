const sgMail = require('@sendgrid/mail');

const { assert, consume } = require('../../helpers/amqp-wrapper');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const processData = ({ email, eToken }) =>
	new Promise((resolve, reject) => {
		sgMail
			.send({
				to: email,
				from: 'no-reply@optimuscp.io',
				subject: 'Welcome to Optimus Deploy! Verify your email.',
				html: `Account activation token for the email: ${email} is: <b>${eToken}</b>`,
			})
			.then(() => resolve(true))
			.catch((err) => reject());
	});

const method = (ch) => {
	assert({ ch, queue: 'mailer_profile:create_orchestrator' });
	consume({ ch, queue: 'mailer_profile:create_orchestrator', process: processData });
};

module.exports = method;
