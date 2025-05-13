const express = require("express");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const { prisma } = require("./config/database");
const routes = require("./routes/mainRoutes");

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use((req, res, next) => {
  const authenticationMiddleware = require("./middleware/authenticationMiddleware");
  authenticationMiddleware()(req, res, () => {
    res.locals.config = require("../config.json");
    res.locals.user = req.user || null;
    next();
  });
});

const createStartupAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    if (!adminEmail || !adminPassword || !adminName) {
      console.warn(
        "ADMIN_* environment variables are not set. Skipping admin account creation."
      );
      return;
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
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
};

createStartupAdmin();

app.use("/api", routes.api);
app.use("/", routes.pages);

app.use((req, res) => {
  res.status(404).send("Page not found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Website Local Host: http://localhost:${PORT}/`)
);
