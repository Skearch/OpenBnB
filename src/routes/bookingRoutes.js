const express = require("express");
const router = express.Router();
const { list } = require("../controllers/bookingController");

router.get("/list/:propertyId", (req, res) => {
  res.json({ bookings: [] });
});

module.exports = router;
