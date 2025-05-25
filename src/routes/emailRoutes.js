const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const { send } = require("../controllers/emailController");

router.post("/send", authenticationMiddleware.requireRoles(["owner", "staff"]), send);

module.exports = router;