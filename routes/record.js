var express = require("express");
var router = express.Router();
var cors = require("cors");
const { send } = require("../blockchain");

// @TODO 测试期间暂时对所有请求开放跨域请求
// 是否只允许某些域名访问？
router.use(cors());

/**
 * error code:
 * 0 - success
 * 1 - invalid key
 * 2 - send tx error
 */

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("record");
});

router.post("/", function (req, res, next) {
  console.log(req.body);

  if (req?.body?.key === "123456") {
    send(req.body.message)
      .then((hash) => {
        res.json({
          code: 0,
          data: {
            hash,
          },
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

// curl -d '{"key":"123456", "message":"hello world 2"}' -H "Content-Type: application/json" -X POST http://localhost:9000/record
// curl -d '{"key":"1", "message":"hello world"}' -H "Content-Type: application/json" -X POST http://localhost:9000/record
