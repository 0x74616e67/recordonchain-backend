var express = require("express");
var router = express.Router();
const sqlite3 = require("sqlite3").verbose();
var path = require("path");

/**
 * error code:
 * 1001 - Code is required
 * 1002 - Database error
 * 1003 - Invalid code or code is verified
 * 1004 - Update verification status error
 */

const db = new sqlite3.Database(
  path.join(__dirname, "./../../database/recordonchain.db"),
  (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    } else {
      console.log("Connected to the SQLite database.");
    }
  }
);

router.post("/", function (req, res, next) {
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
        const sql = "UPDATE verification_code SET verified = 1 WHERE code = ?";

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
              return res.json({
                code: 0,
                data: {
                  verified: true,
                },
                message: "",
              });
            }
          }
        });
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
});

module.exports = router;
