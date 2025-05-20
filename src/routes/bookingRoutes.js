const express = require("express");
const router = express.Router();
const { list, createBooking } = require("../controllers/bookingController");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

router.get("/list/:propertyId", list);

router.post("/create", authenticationMiddleware("guest"), createBooking);

module.exports = router;
