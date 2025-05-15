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

class AccountController {
  static async listAll(req, res) {
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
    } catch (error) {
      console.error("Error listing accounts:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static create = [
    validateInput(accountSchema),
    async (req, res) => {
      try {
        const { name, email, password, role } = req.body;
        if (await AccountController.#userExists(email)) {
          return res.status(400).json({ message: "Email is already in use" });
        }
        const hashedPassword = await AccountController.#hashPassword(password);
        const account = await prisma.user.create({
          data: { name, email, password: hashedPassword, role },
        });
        res
          .status(201)
          .json({ message: "Account created successfully", account });
      } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ message: "Server error" });
      }
    },
  ];

  static update = [
    validateInput(accountSchema),
    async (req, res) => {
      try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;
        const data = { name, email, role };
        if (password) {
          data.password = await AccountController.#hashPassword(password);
        }
        const account = await prisma.user.update({
          where: { id: parseInt(id) },
          data,
        });
        res.json({ message: "Account updated successfully", account });
      } catch (error) {
        console.error("Error updating account:", error);
        res.status(500).json({ message: "Server error" });
      }
    },
  ];

  static async remove(req, res) {
    try {
      const { id } = req.params;
      await prisma.user.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async #userExists(email) {
    return !!(await prisma.user.findUnique({ where: { email } }));
  }

  static async #hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
}

module.exports = {
  listAll: AccountController.listAll,
  create: AccountController.create,
  update: AccountController.update,
  remove: AccountController.remove,
};
