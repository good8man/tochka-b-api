const express = require("express");
const router = express.Router();
const ctrlWrapper = require("../../decorators/ctrlWrapper");
const { newDeal } = require("../../controllers/ringostatToPipedrive");

router.post("/", ctrlWrapper(newDeal));

module.exports = router;
