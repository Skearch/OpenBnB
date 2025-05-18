const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        this.from = process.env.SMTP_FROM || process.env.SMTP_USER;
    }

    /**
     * Send a booking confirmation email.
     * @param {string} to - Recipient email address.
     * @param {object} options - Booking details.
     * @param {string} options.propertyName - Name of the property.
     * @param {string|Date} options.startDate - Booking start date.
     * @param {string|Date} options.endDate - Booking end date.
     * @param {string} [options.guestName] - Name of the guest.
     * @returns {Promise<void>}
     */
    async sendBookingConfirmation(to, { propertyName, startDate, endDate, guestName }) {
        const subject = `Booking Confirmed: ${propertyName}`;
        const formattedStart = this.formatDate(startDate);
        const formattedEnd = this.formatDate(endDate);

        const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Booking Confirmation</h2>
        <p>Dear ${guestName || 'Guest'},</p>
        <p>Your booking for <strong>${propertyName}</strong> has been confirmed.</p>
        <ul>
          <li><strong>Check-in:</strong> ${formattedStart}</li>
          <li><strong>Check-out:</strong> ${formattedEnd}</li>
        </ul>
        <p>Thank you for choosing us!</p>
        <hr>
        <small>This is an automated message. Please do not reply.</small>
      </div>
    `;

        await this.sendMail({ to, subject, html });
    }

    /**
     * Send a generic email.
     * @param {object} options
     * @param {string} options.to
     * @param {string} options.subject
     * @param {string} options.html
     * @param {string} [options.text]
     * @returns {Promise<void>}
     */
    async sendMail({ to, subject, html, text }) {
        const mailOptions = {
            from: this.from,
            to,
            subject,
            html,
            text,
        };
        await this.transporter.sendMail(mailOptions);
    }

    /**
     * Format a date as a readable string.
     * @param {string|Date} date
     * @returns {string}
     */
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