const sgMail = require('@sendgrid/mail');

const { assert, consume } = require('../../helpers/amqp-wrapper');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const processData = ({ email, pToken }) =>
	new Promise((resolve, reject) => {
		sgMail
			.send({
				to: email,
				from: 'no-reply@optimuscp.io',
				subject: 'Welcome to Optimus Deploy! Verify your email.',
				html: `Password reset token for the email: ${email} is: <b>${pToken}</b>`,
			})
			.then(() => resolve(true))
			.catch((err) => reject());
	});

const method = (ch) => {
	assert({ ch, queue: 'mailer_profile:forgotPassword_orchestrator' });
	consume({ ch, queue: 'mailer_profile:forgotPassword_orchestrator', process: processData });
};

module.exports = method;
