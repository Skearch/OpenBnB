const { prisma } = require('../config/database');

const redirect = [
    async (req, res) => {
        try {
            if (!req.user) return res.redirect('/account/login');
            const role = req.user.role;

            switch (role) {
                case "owner":
                    return res.redirect('/dashboard/overview');
                case "staff":
                    return res.redirect('/dashboard/staff');
                case "guest":
                    return res.redirect('/dashboard/guest');
            }

            return res.status(403).send('Access denied');
        } catch (error) {
            console.error('Redirect Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

const formProperty = async (req, res) => {
    const { id } = req.query;
    let property = null;

    if (id) {
        property = await prisma.property.findUnique({
            where: { id: parseInt(id) },
        });

        if (!property) {
            return res.status(404).send('Property not found');
        }

        property.featuredImage = property.featuredImage
            ? Buffer.from(property.featuredImage).toString('base64')
            : null;
        property.images = property.images
            ? property.images.map((image) => Buffer.from(image).toString('base64'))
            : [];
    }

    res.render('dashboard/formProperties', {
        isEdit: !!id,
        property,
    });
};

const properties = [(req, res) => res.render('dashboard/properties')];
const overview = [(req, res) => res.render('dashboard/overview')];
const accounts = [(req, res) => res.render('dashboard/accounts')];

module.exports = { redirect, properties, accounts, overview, formProperty };