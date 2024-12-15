var express = require("express");
var router = express.Router();
var path = require("path");
const { env } = require("./../utils");
const { checkRequestParams } = require("./../middlewares/checkRequestParams");
const db = require("../database").db;

router.get("/", function (req, res, next) {
  const { chain } = req.query;

  if (chain === undefined) {
    res.sendFile(path.join(__dirname, "../out", "records.html"));
  } else {
    next("route");
  }
});

router.get(
  "/",
  checkRequestParams(["pageSize", "chain", "order", "startRowId"]),
  function (req, res, next) {
    const { chain, pageSize, order, startRowId } = req.query;

    let sql = "SELECT rowid as id, * FROM records WHERE rowid < ?";
    let params = [startRowId, pageSize];

    if (chain.trim() !== "") {
      sql += " AND chain = ?";
      params.splice(1, 0, chain);
    } else {
      if (env === "production") {
        sql += " AND chain != 'confluxevmtestnet'";
      }
    }

    sql += ` order by rowid ${order} limit ?`;

    // 查询数据库，检查试用 code 是否存在
    db.all(sql, params, (err, row) => {
      if (err) {
        return res.json({
          code: 1002,
          data: {},
          message: err?.message ? err.message : "Database error",
        });
      }

      // fake delay
      setTimeout(() => {
        res.json({
          code: 0,
          data: row,
          message: "",
        });
      }, 200); // 3000 毫秒
    });
  }
);

module.exports = router;
