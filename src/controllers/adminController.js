const { prisma } = require('../config/database');
const Joi = require('joi');
const validateInput = require('../middleware/validateInput');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer();

const propertySchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    currencySymbol: Joi.string().min(1).max(3).required(),
    address: Joi.string().required(),
});

const listAccounts = [
    authMiddleware('owner'),
    async (req, res) => {
        try {
            const accounts = await prisma.user.findMany({
                select: { id: true, name: true, email: true, role: true },
            });
            res.json(accounts);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

const updateAccountRole = [
    authMiddleware('owner'),
    async (req, res) => {
        const { id } = req.params;
        const { role } = req.body;

        if (!['guest', 'staff', 'owner'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        try {
            const account = await prisma.user.update({
                where: { id: Number(id) },
                data: { role },
            });
            res.json({ message: 'Role updated successfully', account });
        } catch (error) {
            console.error('Error updating role:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

const listProperties = [
    authMiddleware('owner'),
    async (req, res) => {
        try {
            const properties = await prisma.property.findMany({ where: { ownerId: req.user.id } });
            res.json(properties);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
];

const createProperty = [
    authMiddleware('owner'),
    upload.fields([
        { name: 'featuredImage', maxCount: 1 },
        { name: 'images', maxCount: 4 },
    ]),
    validateInput(propertySchema),
    async (req, res) => {
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        const { name, description, price, currencySymbol, address } = req.body;

        const featuredImage = req.files?.['featuredImage']?.[0]?.buffer || null;
        if (!featuredImage) {
            return res.status(400).json({ message: 'Featured image is required.' });
        }

        const images = req.files?.['images']?.map(file => file.buffer) || [];
        if (images.length < 1 || images.length > 4) {
            return res.status(400).json({ message: 'You must upload between 1 and 4 additional images.' });
        }

        try {
            const property = await prisma.property.create({
                data: {
                    ownerId: req.user.id,
                    name,
                    description,
                    price: parseFloat(price),
                    currencySymbol,
                    address,
                    featuredImage,
                    images,
                    availability: { dates: [] },
                },
            });
            res.status(201).json({ message: 'Property created', property });
        } catch (error) {
            console.error('Error creating property:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

module.exports = { listProperties, createProperty, listAccounts, updateAccountRole };