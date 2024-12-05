const db = require("../database").db;

const saveRecord = function (req, res, next) {
  const { hash, chain, message, timestamp } = res.txData;
  const table = `records`;
  const sql = `INSERT INTO ${table} (hash, timestamp, message, chain) VALUES (?, ?, ?, ?) ON CONFLICT(hash) DO NOTHING`;
  const values = [hash, timestamp, message, chain];

  db.run(sql, values, function (err) {
    if (err) {
      console.error(err.message);
    }
    console.log(`成功保存一条交易`);
  });

  // // 创建表
  // db.run(
  //   `
  //     CREATE TABLE IF NOT EXISTS ${table} (
  //       hash TEXT PRIMARY KEY,
  //       timestamp INT DEFAULT 0,
  //       message TEXT,
  //       username TEXT,
  //       chain TEXT,
  //       level INT DEFAULT 0
  //     )
  //   `,
  //   function (err) {
  //     if (err) {
  //       console.error(err.message);
  //     }

  //     console.log(`创建 ${table} 表`);

  //     db.run(sql, values, function (err) {
  //       if (err) {
  //         console.error(err.message);
  //       }
  //       console.log(`成功保存一条交易`);
  //     });
  //   }
  // );

  next();
};

module.exports = { saveRecord };
