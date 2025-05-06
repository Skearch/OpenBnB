const nodemailer = require('nodemailer');

const sendBookingConfirmation = async (to, propertyName, startDate, endDate) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    //Left out the subject and html for now
    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject: '',
        html: ``,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendBookingConfirmation };