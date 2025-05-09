const express = require('express');
const { redirect } = require('../controllers/dashboardController');
const { logout } = require('../controllers/authenticationController');

const dashboardRoutes = express.Router();

dashboardRoutes.get('/redirect', redirect);
dashboardRoutes.get('/logout', logout);

module.exports = dashboardRoutes;