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
} = require("../controllers/dashboardController");
const { logout } = require("../controllers/authenticationController");

const dashboardRoutes = express.Router();

dashboardRoutes.get("/redirect", redirect);
dashboardRoutes.get("/logout", logout);
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

dashboardRoutes.get("/guest", authenticationMiddleware("guest"), guest);

module.exports = dashboardRoutes;
