var express = require("express");
var router = express.Router();
var path = require("path");

const { send, isFreeTrailChain } = require("../blockchain");
const { verifyCode, updateCode } = require("./../middlewares/code");
const { saveRecord } = require("./../middlewares/record");
const db = require("../database").db;

/**
 * error code:
 * 0 - success
 * 1 - ?
 * 2 - send tx error
 * 3 - get tx info error
 * 9 - unknown error
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
        const errorInfo = {
          code: 2,
          data: {},
          message: e?.reason
            ? e?.reason // ethers error
            : e?.message // unexpected error
            ? e?.message
            : "send tx error",
        };

        // 现在是优先给前端返回交易错误的信息，暂时不管 verification code lock 了
        // 这么做的考虑：
        // 1. 更新数据库失败的概率比较小，同时发生交易错误和更新数据库错误的概率就更小
        // 2. 即使更新数据库失败，那么最坏的情况就是用户使用的 verification code 被 lock 了，用户可以联系客服人员进行检查和 unlock
        // 3. 如果用户没有及时联系客服，在平时检查 error code 的时候，注意到发送交易失败的情况后，也可以手动检查相关的 verification code 的 lock 情况，并及时更新
        // TODO 单独记录失败的交易错误信息

        if (isFreeTrailChain(req.body.chain)) {
          next(errorInfo);
        } else {
          const { code, chain } = req.body;
          const TABLE = `verification_code_${chain}`;
          const U_CODE = String(code).toUpperCase();

          // TODO 更新 code locked status 暂时放在这里，后续再优化
          // 重置 verification code locked status
          db.run(
            `UPDATE ${TABLE} SET locked = 0 WHERE code = ?`,
            [U_CODE],
            function (err) {
              if (err || this.changes === 0) {
                console.log(err?.message ? err.message : "Database error");
              }

              next(errorInfo);
            }
          );
        }
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
  },
  function (err, req, res, next) {
    // custom error
    if (err.code && err.data) {
      res.errorInfo = err;
      return res.json(err);
    } else {
      // unexpected error
      const errorInfo = {
        code: 9,
        data: {},
        message: err?.message ? err.message : "Unknown error",
      };
      res.errorInfo = errorInfo;
      return res.json(errorInfo);
    }
  }
);

module.exports = router;
