const express = require("express");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const {
  redirect,
  accounts,
  overview,
  properties,
  propertiesCreate,
  propertiesEdit,
  verification,
  bookings,
  mybookings,
  subscriptions,
  email,
  schedule
} = require("../controllers/dashboardController");
const { logout } = require("../controllers/authenticationController");

const dashboardRoutes = express.Router();

dashboardRoutes.get("/redirect", redirect);
dashboardRoutes.get("/logout", logout);
dashboardRoutes.get("/verification", authenticationMiddleware("guest"), verification);
dashboardRoutes.get("/accounts", authenticationMiddleware("owner"), accounts);
dashboardRoutes.get("/overview", authenticationMiddleware.requireRoles(["owner", "staff"]), overview);
dashboardRoutes.get("/subscriptions", authenticationMiddleware.requireRoles(["owner", "staff"]), subscriptions);
dashboardRoutes.get("/mybooking", authenticationMiddleware("guest"), mybookings);

dashboardRoutes.get("/email", authenticationMiddleware.requireRoles(["owner", "staff"]), email);

dashboardRoutes.get(
  "/properties",
  authenticationMiddleware("owner"),
  properties
);
dashboardRoutes.get(
  "/properties/create",
  authenticationMiddleware("owner"),
  propertiesCreate
);
dashboardRoutes.get(
  "/properties/edit/:id",
  authenticationMiddleware("owner"),
  propertiesEdit
);

dashboardRoutes.get(
  "/properties",
  authenticationMiddleware("owner"),
  properties
);

dashboardRoutes.get(
  "/schedule",
  authenticationMiddleware.requireRoles(["owner", "staff"]),
  schedule
);

dashboardRoutes.get("/bookings", authenticationMiddleware("owner"), bookings);

module.exports = dashboardRoutes;
