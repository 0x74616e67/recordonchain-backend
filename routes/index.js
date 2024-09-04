var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("index", { title: "Express" });
  // config for react index page
  res.sendFile(path.join(__dirname, "../out", "index.html"));
});

module.exports = router;
