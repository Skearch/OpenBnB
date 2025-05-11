const express = require('express');
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const { redirect, properties, accounts, overview } = require('../controllers/dashboardController');
const { logout } = require('../controllers/authenticationController');

const dashboardRoutes = express.Router();

dashboardRoutes.get('/redirect', redirect);
dashboardRoutes.get('/logout', logout);
dashboardRoutes.get('/properties', authenticationMiddleware('owner'), properties);
dashboardRoutes.get('/accounts', authenticationMiddleware('owner'), accounts);
dashboardRoutes.get('/overview', authenticationMiddleware('owner'), overview);

module.exports = dashboardRoutes;