const emailService = require("../services/emailService");

exports.send = async (req, res) => {
    const { emails, subject, message } = req.body;
    if (!emails || !subject || !message) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }
    try {
        await emailService.sendMail({
            to: Array.isArray(emails) ? emails : [emails],
            subject,
            html: message,
            text: message,
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
};