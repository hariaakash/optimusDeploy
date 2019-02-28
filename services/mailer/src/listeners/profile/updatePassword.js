const sgMail = require('@sendgrid/mail');

const { assert, consume } = require('../../helpers/amqp-wrapper');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const processData = ({ email }) =>
	new Promise((resolve, reject) => {
		sgMail
			.send({
				to: email,
				from: 'no-reply@optimuscp.io',
				subject: 'Optimus Deploy: Password Updated',
				html: `Password updated successfully for the email: ${email}.`,
			})
			.then(() => resolve(true))
			.catch((err) => reject());
	});

const method = (ch) => {
	assert({ ch, queue: 'mailer_profile:updatePassword_orchestrator' });
	consume({
		ch,
		queue: 'mailer_profile:updatePassword_orchestrator',
		process: (data) => processData(data),
	});
};

module.exports = method;
