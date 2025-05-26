const { prisma } = require("../config/database");
const emailService = require("../services/emailService");
const config = require('../../config.json');

class BookingController {
    static async listGuestBookings(req, res) {
        try {
            const guestId = req.user.id;
            const bookings = await prisma.booking.findMany({
                where: { guestId },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            featuredImagePath: true,
                            address: true,
                            price: true,
                            currencySymbol: true,
                        },
                    },
                },
                orderBy: { startDate: "desc" },
            });
            res.json({ success: true, bookings });
        } catch (err) {
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    static async cancelBooking(req, res) {
        try {
            const guestId = req.user.id;
            const bookingId = parseInt(req.params.id, 10);

            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
            });

            if (!booking || booking.guestId !== guestId) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            if (["cancelled", "declined"].includes(booking.status)) {
                return res.status(400).json({ success: false, message: "Booking is already cancelled or declined" });
            }

            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: "cancelled" },
            });

            res.json({ success: true, message: "Booking cancelled successfully" });
        } catch (err) {
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    static async listActiveReservations(req, res) {
        try {
            const tomorrow = new Date();
            tomorrow.setHours(0, 0, 0, 0);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const bookings = await prisma.booking.findMany({
                where: {
                    status: "booked",
                    startDate: {
                        gte: tomorrow
                    }
                },
                include: {
                    property: { select: { name: true } },
                    guest: { select: { name: true, email: true } }
                }
            });
            res.json({ success: true, bookings });
        } catch (err) {
            res.status(500).json({ success: false, bookings: [] });
        }
    }

    static async listAll(req, res) {
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
    }

    static async statsMonthly(req, res) {
        try {
            const bookings = await prisma.booking.findMany({
                where: { status: "booked" },
                select: { createdAt: true }
            });
            const now = new Date();
            const months = [];
            const counts = [];
            for (let i = 11; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
                const monthLabel = start.toLocaleString('default', { month: 'short', year: '2-digit' });
                months.push(monthLabel);
                const monthCount = bookings.filter(b => b.createdAt >= start && b.createdAt < end).length;
                counts.push(monthCount);
            }
            res.json({ months, counts });
        } catch (err) {
            res.status(500).json({ months: [], counts: [] });
        }
    }

    static async statsRevenue(req, res) {
        try {
            const bookings = await prisma.booking.findMany({
                where: { status: "booked" },
                select: {
                    createdAt: true,
                    property: { select: { price: true } }
                }
            });
            const total = bookings.reduce((sum, b) => sum + (b.property?.price || 0), 0);
            const average = bookings.length ? total / bookings.length : 0;

            const now = new Date();
            const months = [];
            const values = [];
            for (let i = 11; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
                const monthLabel = start.toLocaleString('default', { month: 'short', year: '2-digit' });
                months.push(monthLabel);
                const monthBookings = bookings.filter(b => b.createdAt >= start && b.createdAt < end);
                const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.property?.price || 0), 0);
                values.push(monthRevenue);
            }

            res.json({ total, average, months, values });
        } catch (err) {
            console.error("Error in statsRevenue:", err);
            res.status(500).json({ total: 0, average: 0, months: [], values: [] });
        }
    }

    static async statsStatus(req, res) {
        try {
            const statuses = ["booked", "pending", "cancelled", "declined"];
            const counts = {};
            for (const status of statuses) {
                counts[status] = await prisma.booking.count({ where: { status } });
            }
            res.json(counts);
        } catch (err) {
            res.status(500).json({ booked: 0, pending: 0, cancelled: 0, declined: 0 });
        }
    }

    static async createBooking(req, res) {
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

            const bookingLimit = parseInt(process.env.GUEST_BOOKING_CURRENTLIMIT, 10) || 2;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const activeBookingsCount = await prisma.booking.count({
                where: {
                    guestId: userId,
                    endDate: { gte: today },
                    status: { in: ["pending", "booked"] }
                }
            });

            if (activeBookingsCount >= bookingLimit) {
                return res.status(400).json({ success: false, message: `You have reached your active booking limit (${bookingLimit}).` });
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
    }

    static async list(req, res) {
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
    }

    static async deleteBooking(req, res) {
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
    }

    static async editBooking(req, res) {
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
    }
}

module.exports = {
    listGuestBookings: BookingController.listGuestBookings,
    cancelBooking: BookingController.cancelBooking,
    listActiveReservations: BookingController.listActiveReservations,
    listAll: BookingController.listAll,
    createBooking: BookingController.createBooking,
    list: BookingController.list,
    deleteBooking: BookingController.deleteBooking,
    editBooking: BookingController.editBooking,
    statsMonthly: BookingController.statsMonthly,
    statsRevenue: BookingController.statsRevenue,
    statsStatus: BookingController.statsStatus
};