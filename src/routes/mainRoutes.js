const express = require("express");

const apiRouter = express.Router();
const pagesRouter = express.Router();

const authenticationRoutes = require("./authenticationRoutes");
const propertyRoutes = require("./propertyRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const accountRoutes = require("./accountRoutes");
const bookingRoutes = require("./bookingRoutes");
const { get: getProperty } = require("../controllers/propertyController");
const emailSubscriptionRoutes = require("./emailSubscriptionRoutes");
const emailRoutes = require("./emailRoutes");

apiRouter.use("/email-subscription", emailSubscriptionRoutes);
apiRouter.use("/authentication", authenticationRoutes);
apiRouter.use("/property", propertyRoutes);
apiRouter.use("/account", accountRoutes);
apiRouter.use("/booking", bookingRoutes);

pagesRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/email", emailRoutes);

pagesRouter.get("/business/about", (req, res) => res.render("pages/about"));
pagesRouter.get("/business/faq", (req, res) => res.render("pages/faq"));
pagesRouter.get("/business/terms", (req, res) => res.render("pages/terms"));

pagesRouter.get("/account/register", (req, res) => res.render("pages/register"));
pagesRouter.get("/account/login", (req, res) => res.render("pages/login"));

pagesRouter.get("/listing/browse", (req, res) => res.render("pages/listing"));

pagesRouter.get("/property/:id", (req, res, next) => {
  req.query.view = "page";
  getProperty(req, res, next);
});

pagesRouter.get("*", (req, res) => res.render("pages/index"));

module.exports = { api: apiRouter, pages: pagesRouter };