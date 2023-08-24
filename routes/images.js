const express = require("express");
const router = express.Router();
const imagesController = require("../controllers/images.controller.js");

router.get("/", imagesController.get);
router.post("/", imagesController.post);

module.exports = router;
