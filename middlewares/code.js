const { isFreeTrailChain } = require("../blockchain");
const db = require("../database").db;

/**
 * error code:
 * 1001 - Code is required
 * 1002 - Database error
 * 1003 - Invalid code or code is verified
 * 1005 - Code is verified
 * 1006 - Code is locked
 */

const verifyCode = function (req, res, next) {
  // 检查是不是试用网络，比如 confluxevmtestnet
  if (isFreeTrailChain(req.body.chain)) {
    next();
  } else {
    const { code, chain } = req.body;

    if (!code) {
      next({
        code: 1001,
        data: {},
        message: "Code is required",
      });
    }
    // gold finger code
    if (code === process.env.CODE_GOLD_FINGER && chain !== "ethereum") {
      next();
    } else {
      const TABLE = `verification_code_${chain}`;
      const U_CODE = String(code).toUpperCase();

      // 查询数据库，检查试用 code 是否存在
      db.get(`SELECT * FROM ${TABLE} WHERE code = ?`, [U_CODE], (err, row) => {
        if (err) {
          next({
            code: 1002,
            data: {},
            message: err?.message ? err.message : "Database error",
          });
        }

        if (row) {
          if (row.verified) {
            next({
              code: 1005,
              data: {
                verified: true,
              },
              message: "Code is verified",
            });
          } else if (row.locked) {
            next({
              code: 1006,
              data: {
                verified: false,
                locked: true,
              },
              message: "Code is locked",
            });
          } else {
            // 在使用 code 进行 create record 的时候，一定要先锁定 code，防止用单一 code 发起同时创建
            db.run(
              `UPDATE ${TABLE} SET locked = 1 WHERE code = ?`,
              [U_CODE],
              function (err) {
                if (err) {
                  next({
                    code: 1002,
                    data: {},
                    message: err?.message ? err.message : "Database error",
                  });
                } else {
                  // 检查更新的行数
                  if (this.changes === 0) {
                    next({
                      code: 1002,
                      data: {},
                      message: err?.message ? err.message : "Database error",
                      // message: err?.message
                      //   ? err.message
                      //   : "Update locked status failed",
                    });
                  } else {
                    next();
                  }
                }
              }
            );
          }
        } else {
          next({
            code: 1003,
            data: {
              verified: false,
            },
            message: "Invalid code or code is verified",
          });
        }
      });
    }
  }
};

const updateCode = function (req, res, next) {
  if (isFreeTrailChain(req.body.chain)) {
    next();
  } else {
    const { code, chain } = req.body;
    const TABLE = `verification_code_${chain}`;
    const U_CODE = String(code).toUpperCase();
    const sql = `UPDATE ${TABLE} SET verified = 1, locked = 0 WHERE code = ?`;

    // gold finger code
    if (code === process.env.CODE_GOLD_FINGER) {
      next();
    } else {
      // 这个是后续步骤，先前已经验证过 code 了，所以此处直接使用
      db.run(sql, [U_CODE], function (err) {
        if (err) {
          next({
            code: 1002,
            data: {},
            message: err?.message ? err.message : "Database error",
          });
        } else {
          // 检查更新的行数
          if (this.changes === 0) {
            next({
              code: 1002,
              data: {},
              message: err?.message ? err.message : "Database error",
              // message: err?.message
              //   ? err.message
              //   : "Update verification status failed",
            });
          } else {
            next();
          }
        }
      });
    }
  }
};

module.exports = { verifyCode, updateCode };
