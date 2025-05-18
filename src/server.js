const express = require("express");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const { prisma } = require("./config/database");
const routes = require("./routes/mainRoutes");
const config = require("../config.json");

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use((req, res, next) => {
  const authenticationMiddleware = require("./middleware/authenticationMiddleware");
  authenticationMiddleware()(req, res, () => {
    res.locals.config = config;
    res.locals.user = req.user || null;
    next();
  });
});

async function createStartupAdmin() {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
      console.warn(
        "ADMIN_* environment variables are not set. Skipping admin account creation."
      );
      return;
    }
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          password: hashedPassword,
          name: ADMIN_NAME,
          role: "owner",
        },
      });
      console.log("Startup admin account created successfully.");
    } else {
      console.log("Startup admin account already exists.");
    }
  } catch (error) {
    console.error("Error creating startup admin account:", error);
  }
}
createStartupAdmin();

app.use("/api", routes.api);
app.use("/", routes.pages);

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res
      .status(404)
      .json({ success: false, message: "API endpoint not found" });
  }
  res.status(404).send("Page not found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Website Local Host: http://localhost:${PORT}/`)
);