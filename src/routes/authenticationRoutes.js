const express = require("express");
const router = express.Router();
const { register, login, verify } = require("../controllers/authenticationController");
const DashboardController = require("../controllers/dashboardController");

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verify);
router.post('/resend-verification', DashboardController.resendVerification);

module.exports = router;
