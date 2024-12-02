var express = require("express");
var router = express.Router();
const { send } = require("../blockchain");
var path = require("path");
const { verifyCode, updateCode } = require("./../middlewares/code");
const { saveRecord } = require("./../middlewares/record");
const db = require("../database").db;

/**
 * error code:
 * 0 - success
 * 1 - ?
 * 2 - send tx error
 * 3 - get tx info error
 */

// return static page file
router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../out", "record.html"));
});

router.get("/detail", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../out/record", "detail.html"));
});

// handle send tx request
/**
 * method: POST
 * body:
 * {
 *   chain: conflux | ethereum
 *   message: string
 *   code: C12345678 | E12345678
 * }
 * response data:
 * {
 *   hash: string,
 *   timestamp: int,
 *   message: 0xhash,
 *   chain: conflux | ethereum,
 * }
 */

router.post(
  "/",
  verifyCode,
  function (req, res, next) {
    send(req.body.chain, req.body.message)
      .then((d) => {
        res.txData = d;

        next();
      })
      .catch((e) => {
        const { code, chain } = req.body;
        const TABLE = `verification_code_${chain}`;
        const U_CODE = String(code).toUpperCase();

        // TODO 更新 code locked status 暂时放在这里，后续再优化
        // 重置 verification code locked status
        db.run(
          `UPDATE ${TABLE} SET locked = 0 WHERE code = ?`,
          [U_CODE],
          function (err) {
            if (err) {
              return res.json({
                code: 1002,
                data: {},
                message: err?.message ? err.message : "Database error",
              });
            } else {
              // 检查更新的行数
              if (this.changes === 0) {
                return res.json({
                  code: 1002,
                  data: {},
                  message: err?.message ? err.message : "Database error",
                });
              } else {
                return res.json({
                  code: 2,
                  data: {},
                  message: e?.message ? e?.message : "send tx error",
                });
              }
            }
          }
        );
      });
  },
  updateCode,
  saveRecord,
  function (req, res, next) {
    return res.json({
      code: 0,
      data: res.txData,
      message: "",
    });
  }
);

module.exports = router;
