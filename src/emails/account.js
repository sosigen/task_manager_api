const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 's.nowacki08@gmail.com',
		subject: 'Thanks jor joining in :D',
		text: `hello there ${name}. Long time no see, partner...`,
	});
};

const sendGoodbyeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 's.nowacki08@gmail.com',
		subject: 'Goodbye friend',
		text: `farewell ${name}. I hope you had a great time using my app. I count on getting some feedback of yours to imporove my work.`,
	});
};

module.exports = { sendWelcomeEmail, sendGoodbyeEmail };
