const { prisma } = require("../config/database");
const Joi = require("joi");
const validateInput = require("../middleware/validateInput");
const bcrypt = require("bcrypt");

const accountSchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid("guest", "staff", "owner").required(),
});

const listAll = async (req, res) => {
  try {
    const accounts = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(accounts);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const create = [
  validateInput(accountSchema),
  async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser)
        return res.status(400).json({ message: "Email is already in use" });
      const hashedPassword = await bcrypt.hash(password, 10);
      const account = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
      });
      res
        .status(201)
        .json({ message: "Account created successfully", account });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
];

const update = [
  validateInput(accountSchema),
  async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    try {
      const data = { name, email, role };
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword;
      }
      const account = await prisma.user.update({
        where: { id: parseInt(id) },
        data,
      });
      res.json({ message: "Account updated successfully", account });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
];

const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Account deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { listAll, create, update, remove };
