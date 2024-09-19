var express = require("express");
var router = express.Router();
const { send } = require("../blockchain/conflux");
var path = require("path");

/**
 * error code:
 * 0 - success
 * 1 - invalid key
 * 2 - send tx error
 */

router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../out", "record.html"));
});

router.get("/detail", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../out/record", "detail.html"));
});

router.post("/", function (req, res, next) {
  console.log(req.body);

  // if (req?.body?.key === "123456") {
  // TODO pay logic
  if (true) {
    send(req.body.chain, req.body.message)
      .then((d) => {
        res.json({
          code: 0,
          data: d,
          message: "",
        });
      })
      .catch((e) => {
        console.log(e);

        res.json({
          code: 2,
          data: {},
          message: "send tx error",
        });
      });
  } else {
    res.json({
      code: 1,
      data: {},
      message: "invalid key",
    });
  }
});

module.exports = router;
