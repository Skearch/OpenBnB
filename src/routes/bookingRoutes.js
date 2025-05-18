const express = require("express");
const router = express.Router();

router.get("/list/:propertyId", (req, res) => {
  res.json({ bookings: [] });
});

module.exports = router;
