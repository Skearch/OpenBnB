const { prisma } = require('../config/database');
const Joi = require('joi');
const validateInput = require('../middleware/validateInput');
const authMiddleware = require('../middleware/authMiddleware');
const { sendBookingConfirmation } = require('../services/emailService');

const bookingSchema = Joi.object({
    propertyId: Joi.number().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
});

const listShowcaseProperties = async (req, res) => {
    try {
        const properties = await prisma.property.findMany({
            where: { showcase: true },
        });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const listProperties = async (req, res) => {
    try {
        const properties = await prisma.property.findMany();
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createBooking = [
    authMiddleware('guest'),
    validateInput(bookingSchema),
    async (req, res) => {
        const { propertyId, startDate, endDate } = req.body;
        const guestId = req.user.id;
        try {
            const property = await prisma.property.findUnique({ where: { id: propertyId } });
            if (!property) return res.status(404).json({ message: 'Property not found' });

            const availability = property.availability.dates || [];
            const isAvailable = availability.every(date =>
                new Date(date) < new Date(startDate) || new Date(date) > new Date(endDate)
            );
            if (!isAvailable) return res.status(400).json({ message: 'Property not available' });

            const reservation = await prisma.reservation.create({
                data: {
                    propertyId,
                    guestId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    status: 'confirmed',
                },
            });

            const newAvailability = [...availability, startDate, endDate];
            await prisma.property.update({
                where: { id: propertyId },
                data: { availability: { dates: newAvailability } },
            });

            await sendBookingConfirmation(req.user.email, property.name, startDate, endDate);

            res.status(201).json({ message: 'Booking created', reservation });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
];

module.exports = { listProperties, createBooking,  listShowcaseProperties};