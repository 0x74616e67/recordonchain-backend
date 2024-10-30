var express = require("express");
var router = express.Router();
var path = require("path");
const { checkRequestParams } = require("./../middlewares/checkRequestParams");
const db = require("../database").db;

router.get(
  "/",
  checkRequestParams(["page", "pageSize", "chain", "order", "startRowId"]),
  function (req, res, next) {
    const { chain, pageSize, page, order, startRowId } = req.query;
    let sql = `SELECT rowid as id, * FROM records_${chain}`;

    if (startRowId) {
      sql += " WHERE rowid <= ?";
    }

    sql += ` order by rowid ${order} limit ? offset ?`;

    // 查询数据库，检查试用 code 是否存在
    db.all(sql, [pageSize, (page - 1) * pageSize], (err, row) => {
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
