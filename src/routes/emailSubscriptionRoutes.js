const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

const {
    subscribe,
    list,
    delete: deleteSubscription,
    edit,
} = require("../controllers/emailSubscriptionController");

router.post("/subscribe", subscribe);
router.get("/list", authenticationMiddleware.requireRoles(["owner", "staff"]), list);
router.delete("/delete/:id", authenticationMiddleware.requireRoles(["owner", "staff"]), deleteSubscription);
router.put("/edit/:id", authenticationMiddleware.requireRoles(["owner", "staff"]), edit);

module.exports = router;