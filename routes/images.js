const express = require("express");
const router = express.Router();
const imagesController = require("../controllers/images.controller");

router.get("/:images", imagesController.get);

module.exports = router;
