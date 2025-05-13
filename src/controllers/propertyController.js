const { prisma } = require('../config/database');

const listAll = async (req, res) => {
    try {
        const properties = await prisma.property.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                showcase: true,
                featuredImage: true,
            },
        });

        const propertiesWithImages = properties.map(property => ({
            ...property,
            featuredImage: property.featuredImage
                ? Buffer.from(property.featuredImage).toString('base64')
                : null,
        }));

        res.json({ success: true, properties: propertiesWithImages });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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

const createProperty = async (req, res) => {
    try {
        const { name, price, description, showcase, hours, currencySymbol, address } = req.body;
        const featuredImage = req.files?.featuredImage?.[0]?.buffer;
        const images = req.files?.images?.map(file => file.buffer) || [];

        if (images.length < 1) {
            return res.status(400).json({ message: 'You must upload at least 1 additional image.' });
        }

        if (!featuredImage) {
            return res.status(400).json({ message: 'You must select one image as the featured image.' });
        }

        const property = await prisma.property.create({
            data: {
                name,
                price: parseFloat(price),
                description,
                hours: hours ? parseInt(hours) : 24,
                currencySymbol: currencySymbol || '$',
                address: address || '',
                showcase: showcase === 'true',
                featuredImage,
                images,
                ownerId: req.user.id,
            },
        });

        res.status(201).json({ success: true, property });
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const editProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, showcase, hours, currencySymbol, address } = req.body;
        const featuredImage = req.files?.featuredImage?.[0]?.buffer;
        const images = req.files?.images?.map(file => file.buffer) || [];

        if (images.length < 1) {
            return res.status(400).json({ message: 'You must upload at least 1 additional image.' });
        }

        if (!featuredImage) {
            return res.status(400).json({ message: 'You must select one image as the featured image.' });
        }
        
        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required.' });
        }

        const property = await prisma.property.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price: parseFloat(price),
                description,
                hours: hours ? parseInt(hours) : 24,
                currencySymbol: currencySymbol || '$',
                address: address || '',
                showcase: showcase === 'true',
                featuredImage,
                images,
                ownerId: req.user.id,
            },
        });

        res.status(200).json({ success: true, property });
    } catch (error) {
        console.error('Error editing property:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.property.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { listAll, listShowcase, createProperty, editProperty, deleteProperty };