const express = require("express");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const {
  redirect,
  accounts,
  overview,
  properties,
  propertiesCreate,
  propertiesEdit,
  guest,
  verification,
  bookings,
} = require("../controllers/dashboardController");
const { logout } = require("../controllers/authenticationController");

const dashboardRoutes = express.Router();

dashboardRoutes.get("/redirect", redirect);
dashboardRoutes.get("/logout", logout);
dashboardRoutes.get("/verification", authenticationMiddleware("guest"), verification);
dashboardRoutes.get("/accounts", authenticationMiddleware("owner"), accounts);
dashboardRoutes.get("/overview", authenticationMiddleware("owner"), overview);

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

dashboardRoutes.get("/bookings", authenticationMiddleware("owner"), bookings);

module.exports = dashboardRoutes;
