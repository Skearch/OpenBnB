const express = require("express");
const router = express.Router();
const {
    list,
    listAll,
    createBooking,
    deleteBooking,
    editBooking,
    listGuestBookings,
    cancelBooking,
    listActiveReservations
} = require("../controllers/bookingController");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

router.get("/list/:propertyId", list);
router.post("/create", authenticationMiddleware("guest"), createBooking);

router.get("/listall", authenticationMiddleware("owner"), listAll);

router.get("/guest/list", authenticationMiddleware("guest"), listGuestBookings);
router.delete("/guest/cancel/:id", authenticationMiddleware("guest"), cancelBooking);

router.delete("/delete/:id", authenticationMiddleware("owner"), deleteBooking);
router.put("/edit/:id", authenticationMiddleware("owner"), editBooking);

router.get("/active/list", authenticationMiddleware("owner"), listActiveReservations);

module.exports = router;