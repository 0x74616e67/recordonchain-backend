var express = require("express");
var router = express.Router();
var db = require("../database").db;

router.get("/", function (req, res, next) {
  const code = req.query.code;

  if (!code) {
    res.send("Code is required");
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
        res.send("Code is valid");
      } else {
        res.send("Invalid code or code is verified");
      }
    }
  );
});

module.exports = router;
