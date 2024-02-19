const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const router = require("./routes/api/webhook");
const deals = require("./routes/api/deals");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
// app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/webhook", router);
app.use("/api/newdeal", deals);

app.use((_, res, __) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _, res, __) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(3000, () => {
  console.log("Server running. Use our API on port: 3000")
})

// module.exports = app;

