const express = require("express");
const router = express.Router();
const { getCategories, getLevels, seedConfig } = require("../controllers/configController");

router.get("/categories", getCategories);
router.get("/levels", getLevels);
router.post("/seed", seedConfig); // One-time use to seed the DB

module.exports = router;
