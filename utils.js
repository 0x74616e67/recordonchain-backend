require("dotenv").config();

function prefix(param) {
  return `${
    process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() + "_" : ""
  }${param}`;
}

function getProcessEnv(param) {
  return param ? process.env[prefix(param)] || process.env[param] : process.env;
}

function getEnv() {
  return process.env.NODE_ENV;
}

const env = process.env.NODE_ENV;

module.exports = {
  getProcessEnv,
  prefix,
  env,
};
