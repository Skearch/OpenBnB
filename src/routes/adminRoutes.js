const express = require('express');
const router = express.Router();
const { listProperties, createProperty, listAccounts, updateAccountRole } = require('../controllers/adminController');

router.get('/properties', listProperties);
router.post('/properties', createProperty);

router.get('/users', listAccounts);
router.put('/users/:id/role', updateAccountRole);

module.exports = router;