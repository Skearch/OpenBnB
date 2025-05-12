const express = require('express');
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const { redirect, properties, accounts, overview, formProperty } = require('../controllers/dashboardController');
const { logout } = require('../controllers/authenticationController');

const dashboardRoutes = express.Router();

dashboardRoutes.get('/redirect', redirect);
dashboardRoutes.get('/logout', logout);
dashboardRoutes.get('/accounts', authenticationMiddleware('owner'), accounts);
dashboardRoutes.get('/overview', authenticationMiddleware('owner'), overview);

dashboardRoutes.get('/properties', authenticationMiddleware('owner'), properties);
dashboardRoutes.get('/properties/create', authenticationMiddleware('owner'), formProperty);
dashboardRoutes.get('/properties/edit', authenticationMiddleware('owner'), formProperty);

module.exports = dashboardRoutes;