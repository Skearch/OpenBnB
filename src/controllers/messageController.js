const { prisma } = require('../config/database');
const Joi = require('joi');
const validateInput = require('../middleware/validateInput');
const authMiddleware = require('../middleware/authMiddleware');

const messageSchema = Joi.object({
    receiverId: Joi.number().required(),
    content: Joi.string().required(),
});

const getMessages = [
    authMiddleware(),
    async (req, res) => {
        const userId = req.user.id;
        try {
            const messages = await prisma.message.findMany({
                where: { OR: [{ senderId: userId }, { receiverId: userId }] },
                orderBy: { timestamp: 'asc' },
            });
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
];

const sendMessage = [
    authMiddleware(),
    validateInput(messageSchema),
    async (req, res) => {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;
        try {
            const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
            if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

            const message = await prisma.message.create({
                data: { senderId, receiverId, content },
            });
            res.status(201).json({ message: 'Message sent', message });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

module.exports = { getMessages, sendMessage };