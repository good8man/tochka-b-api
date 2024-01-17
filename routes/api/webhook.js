const express = require("express");
const router = express.Router();
const ctrlWrapper = require("../../decorators/ctrlWrapper");
const { newLead } = require("../../controllers/pipedriveCRM");

router.post("/", ctrlWrapper(newLead));

module.exports = router;
