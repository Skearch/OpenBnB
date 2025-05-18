const { prisma } = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const validateInput = require("../middleware/validateInput");
const emailService = require("../services/emailService");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verifySchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
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
        const hashedPassword = await AuthenticationController.#hashPassword(password);
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: "guest",
            verified: false,
            verificationCode: null,
          },
        });
        res.status(201).json({ message: "User registered. Please log in to verify your email.", userId: user.id });
      } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Server error" });
      }
    },
  ];

  static verify = [
    validateInput(verifySchema),
    async (req, res) => {
      const { email, code } = req.body;
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return res.status(400).json({ message: "User not found" });
        }
        if (user.verified) {
          return res.status(400).json({ message: "User already verified" });
        }
        if (user.verificationCode !== code) {
          return res.status(400).json({ message: "Invalid verification code" });
        }
        await prisma.user.update({
          where: { email },
          data: { verified: true, verificationCode: null },
        });
        res.json({ message: "Email verified successfully" });
      } catch (error) {
        console.error("Error during verification:", error);
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
        if (!user) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        if (!(await AuthenticationController.#comparePassword(password, user.password))) {
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

        const rdirect = req.query.rdirect;
        if (
          rdirect &&
          typeof rdirect === "string" &&
          /^\/[^\s]*$/.test(rdirect)
        ) {
          return res.json({
            message: "Logged in",
            user: { id: user.id, role: user.role },
            redirect: rdirect,
          });
        }

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

  static #generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

module.exports = {
  register: AuthenticationController.register,
  login: AuthenticationController.login,
  logout: AuthenticationController.logout,
  verify: AuthenticationController.verify,
};