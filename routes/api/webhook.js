const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const formData = req.body;
  console.log(formData);
  res.send("ok");
});

module.exports = router;
