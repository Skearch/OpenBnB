const express = require('express');

const apiRouter = express.Router();
const pagesRouter = express.Router();

const authenticationRoutes = require('./authenticationRoutes');
const propertyRoutes = require('./propertyRoutes');
const dashboardRoutes = require('./dashboardRoutes');

apiRouter.use('/authentication', authenticationRoutes);
apiRouter.use('/property', propertyRoutes);

pagesRouter.get('/account/register', (req, res) => res.render('pages/register'));
pagesRouter.get('/account/login', (req, res) => res.render('pages/login'));

pagesRouter.use('/dashboard', dashboardRoutes);

pagesRouter.get('/listing/browse', async (req, res) => { res.render('pages/listing'); });
pagesRouter.get('*', async (req, res) => { res.render('pages/index'); });

module.exports = { api: apiRouter, pages: pagesRouter };