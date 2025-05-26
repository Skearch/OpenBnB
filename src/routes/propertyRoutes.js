const express = require("express");
const router = express.Router();

const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const {
  get,
  listAll,
  listShowcase,
  createProperty,
  editProperty,
  deleteProperty,
  cloneProperty,
  upload,
  statusOccupancy,
} = require("../controllers/propertyController");

router.post("/clone/:id", authenticationMiddleware("owner"), cloneProperty);

router.get("/get/:id", get);

router.get("/listall", listAll);

router.get("/listshowcase", listShowcase);

router.post(
  "/create",
  authenticationMiddleware("owner"),
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "images", maxCount: 4 },
  ]),
  createProperty
);

router.put(
  "/edit/:id",
  authenticationMiddleware("owner"),
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "images", maxCount: 4 },
  ]),
  editProperty
);

router.get(
  "/stats/occupancy", authenticationMiddleware.requireRoles(["owner", "staff"]), statusOccupancy);

router.delete("/delete/:id", authenticationMiddleware("owner"), deleteProperty);

module.exports = router;
