const { prisma } = require("../config/database");
const emailService = require("../services/emailService");

exports.createBooking = async (req, res) => {
    try {
        let { propertyId, startDate, endDate } = req.body;
        const userId = req.user.id;

        const parsedPropertyId = parseInt(propertyId, 10);
        if (isNaN(parsedPropertyId)) {
            return res.status(400).json({ success: false, message: "Invalid property ID." });
        }

        const overlap = await prisma.booking.findFirst({
            where: {
                propertyId: parsedPropertyId,
                OR: [
                    {
                        startDate: { lte: endDate },
                        endDate: { gte: startDate },
                    },
                ],
                status: { in: ["pending", "booked"] },
            },
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
            subject: "Booking Request Received",
            html: `<p>Hi ${user.name},<br>Your booking request is received and pending approval.</p>`,
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