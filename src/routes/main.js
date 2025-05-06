const express = require('express');
const { prisma } = require('../config/database');

const apiRouter = express.Router();
const pagesRouter = express.Router();

const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingRoutes');
const adminRoutes = require('./adminRoutes');
const messageRoutes = require('./messageRoutes');

apiRouter.use('/auth', authRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/messages', messageRoutes);

pagesRouter.get('/booking', (req, res) => res.render('pages/booking'));
pagesRouter.get('/account/register', (req, res) => res.render('pages/register'));
pagesRouter.get('/account/login', (req, res) => res.render('pages/login'));
pagesRouter.get('/messages', (req, res) => res.render('pages/messages'));
pagesRouter.get('/dashboard', (req, res) => {
    if (!req.user) return res.redirect('/account/login');
    const role = req.user.role;
    if (role === 'owner') return res.render('dashboard/admin');
    if (role === 'staff') return res.render('dashboard/staff');
    if (role === 'guest') return res.render('dashboard/guest');
    return res.status(403).send('Access denied');
});
pagesRouter.get('/listing/browse', async (req, res) => {
    try {
        const allProperties = await prisma.property.findMany();
        res.render('pages/listing', { properties: allProperties });
    } catch (error) {
        console.error('Error fetching all properties:', error);
        res.status(500).send('Server error');
    }
});
pagesRouter.get('*', async (req, res) => {
    try {
        const showcasedProperties = await prisma.property.findMany({ where: { showcase: true } });
        res.render('pages/index', { showcasedProperties });
    } catch (error) {
        console.error('Error fetching showcased properties:', error);
        res.status(500).send('Server error');
    }
});

module.exports = { api: apiRouter, pages: pagesRouter };