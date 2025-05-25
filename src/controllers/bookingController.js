const { prisma } = require("../config/database");
const emailService = require("../services/emailService");
const config = require('../../config.json');

exports.listAll = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                property: { select: { name: true } },
                guest: { select: { name: true, email: true } }
            }
        });
        res.json({ bookings });
    } catch (err) {
        console.error("Error in bookingController.listAll:", err);
        res.status(500).json({ bookings: [] });
    }
};

exports.createBooking = async (req, res) => {
    try {
        let { propertyId, startDate, endDate } = req.body;
        const userId = req.user.id;

        if (startDate && !startDate.includes("T")) {
            startDate = new Date(startDate).toISOString();
        }
        if (endDate && !endDate.includes("T")) {
            endDate = new Date(endDate).toISOString();
        }

        const parsedPropertyId = parseInt(propertyId, 10);
        if (isNaN(parsedPropertyId)) {
            return res.status(400).json({ success: false, message: "Invalid property ID." });
        }

        const overlap = await prisma.booking.findFirst({
            where: {
                propertyId: parsedPropertyId,
                startDate: { lte: endDate },
                endDate: { gte: startDate },
                status: { in: ["pending", "booked"] }
            }
        });
        if (overlap) {
            return res.status(400).json({ success: false, message: "Selected dates are not available." });
        }

        const booking = await prisma.booking.create({
            data: {
                propertyId: parsedPropertyId,
                guestId: userId,
                startDate,
                endDate,
                status: "pending",
            },
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        await emailService.sendMail({
            to: user.email,
            subject: "Your Booking Request Has Been Received",
            html: `
                <p>Hi ${user.name},</p>
                <p>Thank you for choosing ${config.Business.Name}! We’ve received your booking request and it is currently pending approval.</p>
                <p>You can check the status of your booking or find more information anytime by visiting your dashboard on our website.</p>
                <p>We’ll notify you as soon as your request is reviewed.</p>
                <p>Best regards,<br>${config.Business.Name} Team</p>
            `,
        });

        res.json({ success: true, booking });
    } catch (err) {
        console.error("Error in createBooking:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.list = async (req, res) => {
    try {
        const propertyId = parseInt(req.params.propertyId, 10);
        if (isNaN(propertyId)) {
            return res.status(400).json({ bookings: [] });
        }
        const bookings = await prisma.booking.findMany({
            where: { propertyId },
            select: {
                id: true,
                propertyId: true,
                guestId: true,
                startDate: true,
                endDate: true,
                status: true,
                guest: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
        });
        res.json({ bookings });
    } catch (err) {
        console.error("Error in bookingController.list:", err);
        res.status(500).json({ bookings: [] });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                guest: { select: { name: true, email: true } },
                property: { select: { name: true } }
            }
        });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
        await prisma.booking.delete({ where: { id: parseInt(id, 10) } });

        await emailService.sendMail({
            to: booking.guest.email,
            subject: "Your Booking Has Been Deleted",
            html: `
                <p>Hi ${booking.guest.name},</p>
                <p>Your booking for <b>${booking.property.name}</b> has been deleted by the admin/owner.</p>
                <p>If you have questions, please contact us.</p>
                <p>Best regards,<br>${config.Business.Name} Team</p>
            `,
        });

        res.json({ success: true, message: "Booking deleted and user notified." });
    } catch (err) {
        console.error("Error in deleteBooking:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.editBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = await prisma.booking.update({
            where: { id: parseInt(id, 10) },
            data: { status },
            include: {
                guest: { select: { name: true, email: true } },
                property: { select: { name: true } }
            }
        });

        await emailService.sendMail({
            to: booking.guest.email,
            subject: "Your Booking Status Has Changed",
            html: `
                <p>Hi ${booking.guest.name},</p>
                <p>The status of your booking for <b>${booking.property.name}</b> has been updated to <b>${status.charAt(0).toUpperCase() + status.slice(1)}</b>.</p>
                <p>Thank you for using ${config.Business.Name}.</p>
                <p>Best regards,<br>${config.Business.Name} Team</p>
            `,
        });

        res.json({ success: true, booking });
    } catch (err) {
        console.error("Error in editBooking:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};