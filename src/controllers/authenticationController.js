const { prisma } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const validateInput = require('../middleware/validateInput');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const logout = [
    async (req, res) => {
        try {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.redirect('/');
        } catch (error) {
            console.error('Logout Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

const register = [
    validateInput(registerSchema),
    async (req, res) => {
        const { email, password, name } = req.body;
        try {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: { email, password: hashedPassword, name, role: 'guest' },
            });

            res.status(201).json({ message: 'User registered', userId: user.id });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

const login = [
    validateInput(loginSchema),
    async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return res.status(400).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { id: user.id, role: user.role, name: user.name, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            const refreshToken = jwt.sign(
                { id: user.id, role: user.role, name: user.name, email: user.email },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });
            res.json({ message: 'Logged in', user: { id: user.id, role: user.role } });
        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

module.exports = { register, login, logout };