const express = require("express");
const router = express.Router();
const { list, listAll, createBooking, deleteBooking, editBooking } = require("../controllers/bookingController");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

router.get("/list/:propertyId", list);
router.get("/listall", authenticationMiddleware("owner"), listAll);
router.post("/create", authenticationMiddleware("guest"), createBooking);

router.delete("/delete/:id", authenticationMiddleware("owner"), deleteBooking);
router.put("/edit/:id", authenticationMiddleware("owner"), editBooking);

module.exports = router;
module.exports = router;
