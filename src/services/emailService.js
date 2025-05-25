const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        this.from = process.env.SMTP_FROM;
    }

    async sendMail({ to, subject, html, text }) {
        const mailOptions = {
            from: this.from,
            to,
            subject,
            html,
            text,
        };
        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Error sending email:', err);
            throw err;
        }
    }

    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}

const emailService = new EmailService();
module.exports = emailService;