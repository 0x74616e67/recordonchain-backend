const { getProcessEnv } = require("../utils");

async function main(params) {
  console.log("NODE_ENV", getProcessEnv("NODE_ENV"));
  console.log("ETHEREUM_RPC_URL", getProcessEnv("ETHEREUM_RPC_URL"));
  console.log("production ETHEREUM_RPC_URL", getProcessEnv("ETHEREUM_RPC_URL"));

  process.exit(0);
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
