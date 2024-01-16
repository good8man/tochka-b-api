const express = require("express");
const router = express.Router();
const ctrlWrapper = require("../../decorators/ctrlWrapper");
const { addDeal } = require("../../controllers/pipedriveCRM");

// router.post("/", (req, res) => {
//   const formData = req.body;
//   console.log(formData);
//   res.send("OK");
// });

router.post("/", ctrlWrapper(addDeal));

module.exports = router;
