const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const {
  listAll,
  create,
  update,
  remove,
} = require("../controllers/accountController");

router.get("/listall", listAll);
router.post("/create", authenticationMiddleware("owner"), create);
router.put("/update/:id", authenticationMiddleware("owner"), update);
router.delete("/delete/:id", authenticationMiddleware("owner"), remove);

module.exports = router;
