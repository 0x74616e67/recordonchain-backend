const { NETWORKS } = require("./../blockchain");

/**
 * error code:
 * 5001 - request params error
 */

// 配置默认验证规则
const rules = {
  page: {
    validator: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    errorMessage: "Page must be a positive integer.",
  },
  pageSize: {
    validator: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    errorMessage: "PageSize must be a positive integer.",
  },
  chain: {
    validator: (value) => Object.keys(NETWORKS).includes(value),
    errorMessage: "Chain is not valid.",
  },
  order: {
    validator: (value) => ["asc", "desc"].includes(String(value).toLowerCase()),
    errorMessage: "order is not valid.",
  },
  startRowId: {
    validator: (value) =>
      value === "undefined" ||
      (Number.isInteger(Number(value)) && Number(value) > 0),
    errorMessage: "startRowId is not valid.",
  },
};

function checkRequestParams(validations) {
  return (req, res, next) => {
    const errors = [];

    for (const key in validations) {
      const name =
        typeof validations[key] === "string" ? validations[key] : key;

      const value = req.query[name];

      // TODO 待优化，此处应支持自定义 validator 和 errorMessage
      const { validator, errorMessage } = rules[name];

      // 使用自定义验证函数
      if (!validator(value)) {
        errors.push({ error: errorMessage });
      }
    }

    if (errors.length) {
      return res.json({
        code: 5001,
        data: {},
        message: "Request params error",
        detail: errors,
      });
    }

    // 所有验证通过，继续执行下一个中间件
    next();
  };
}

module.exports = { checkRequestParams };
