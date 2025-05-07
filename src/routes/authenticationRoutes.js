const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authenticationController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.redirect('/');
});

module.exports = router;