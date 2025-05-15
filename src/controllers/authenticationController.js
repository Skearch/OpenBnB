const { prisma } = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const validateInput = require("../middleware/validateInput");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

class AuthenticationController {
  static logout = async (req, res) => {
    try {
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      res.redirect("/");
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  static register = [
    validateInput(registerSchema),
    async (req, res) => {
      const { email, password, name } = req.body;
      try {
        if (await AuthenticationController.#userExists(email)) {
          return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await AuthenticationController.#hashPassword(
          password
        );
        const user = await prisma.user.create({
          data: { email, password: hashedPassword, name, role: "guest" },
        });
        res.status(201).json({ message: "User registered", userId: user.id });
      } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Server error" });
      }
    },
  ];

  static login = [
    validateInput(loginSchema),
    async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (
          !user ||
          !(await AuthenticationController.#comparePassword(
            password,
            user.password
          ))
        ) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        const tokenPayload = {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
        };
        const token = AuthenticationController.#generateToken(
          tokenPayload,
          process.env.JWT_SECRET,
          "15m"
        );
        const refreshToken = AuthenticationController.#generateToken(
          tokenPayload,
          process.env.JWT_REFRESH_SECRET,
          "7d"
        );

        res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
        });
        res.json({
          message: "Logged in",
          user: { id: user.id, role: user.role },
        });
      } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
      }
    },
  ];

  static async #userExists(email) {
    return !!(await prisma.user.findUnique({ where: { email } }));
  }

  static async #hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async #comparePassword(plain, hash) {
    return await bcrypt.compare(plain, hash);
  }

  static #generateToken(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn });
  }
}

module.exports = {
  register: AuthenticationController.register,
  login: AuthenticationController.login,
  logout: AuthenticationController.logout,
};
