const { prisma } = require('../config/database');
const Joi = require('joi');
const validateInput = require('../middleware/validateInput');
const multer = require('multer');

const propertySchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    currencySymbol: Joi.string().min(1).max(3).required(),
    address: Joi.string().required(),
});

const upload = multer({
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

const update = [
    upload.fields([
        { name: 'featuredImage', maxCount: 1 },
        { name: 'images', maxCount: 4 },
    ]),
    async (req, res) => {
        const { id } = req.params;
        const { name, description, price, currencySymbol, address } = req.body;

        const featuredImage = req.files?.['featuredImage']?.[0]?.buffer || null;
        const images = req.files?.['images']?.map(file => file.buffer) || [];

        try {
            const data = {
                name,
                description,
                price: parseFloat(price),
                currencySymbol,
                address,
            };

            if (featuredImage) data.featuredImage = featuredImage;
            if (images.length > 0) data.images = images;

            const property = await prisma.property.update({
                where: { id: parseInt(id) },
                data,
            });

            res.json({ message: 'Property updated successfully', property });
        } catch (error) {
            console.error('Error updating property:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
];

const listAll = async (req, res) => {
    try {
        const properties = await prisma.property.findMany();
        const propertiesWithImages = properties.map(property => ({
            ...property,
            featuredImage: property.featuredImage
                ? Buffer.from(property.featuredImage).toString('base64')
                : null,
        }));
        res.json(propertiesWithImages);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const listShowcase = async (req, res) => {
    try {
        const properties = await prisma.property.findMany({ where: { showcase: true } });
        const propertiesWithImages = properties.map(property => ({
            ...property,
            featuredImage: property.featuredImage
                ? Buffer.from(property.featuredImage).toString('base64')
                : null,
        }));
        res.json(propertiesWithImages);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const create = [
    upload.fields([
        { name: 'featuredImage', maxCount: 1 },
        { name: 'images', maxCount: 4 },
    ]),
    validateInput(propertySchema),
    async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { name, description, price, currencySymbol, address } = req.body;

        const featuredImage = req.files?.['featuredImage']?.[0]?.buffer || null;
        const images = req.files?.['images']?.map(file => file.buffer) || [];

        if (!featuredImage) {
            return res.status(400).json({ message: 'Featured image is required.' });
        }

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

            return res.status(201).json({ message: 'Property created successfully', property });
        } catch (error) {
            console.error('Error creating property:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },
];

module.exports = { listAll, create, listShowcase, update };