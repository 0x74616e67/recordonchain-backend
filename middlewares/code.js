const { isFreeTrailChain } = require("../blockchain");
var db = require("../database").db;

/**
 * error code:
 * 1001 - Code is required
 * 1002 - Database error
 * 1003 - Invalid code or code is verified
 * 1004 - Update verification status error
 */

const verifyCode = function (req, res, next) {
  if (isFreeTrailChain(req.body.chain)) {
    next();
  } else {
    const code = req.body.code;

    if (!code) {
      return res.json({
        code: 1001,
        data: {},
        message: "Code is required",
      });
    }

    // 查询数据库，检查试用 code 是否存在
    db.get(
      "SELECT * FROM verification_code WHERE code = ?",
      [code],
      (err, row) => {
        if (err) {
          return res.json({
            code: 1002,
            data: {},
            message: err?.message ? err.message : "Database error",
          });
        }

        if (row && !row.verified) {
          next();
        } else {
          return res.json({
            code: 1003,
            data: {
              verified: false,
            },
            message: "Invalid code or code is verified",
          });
        }
      }
    );
  }
};

const updateCode = function (req, res, next) {
  if (isFreeTrailChain(req.body.chain)) {
    next();
  } else {
    const code = req.body.code;
    const sql = "UPDATE verification_code SET verified = 1 WHERE code = ?";

    // 这个是后续步骤，先前已经验证过 code 了，所以此处直接使用
    db.run(sql, [code], function (err) {
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
            code: 1004,
            data: {},
            message: err?.message
              ? err.message
              : "Update verification status failed",
          });
        } else {
          next();
        }
      }
    });
  }
};

module.exports = { verifyCode, updateCode };
