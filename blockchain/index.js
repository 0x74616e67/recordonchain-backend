const ethers = require("ethers");
const { getProcessEnv } = require("../utils");

// TODO 以太坊和 fork 的链共用一个私钥
// 后期要考虑一下是用 EOA 还是合约地址
const NETWORKS = {
  conflux: {
    rpcUrl: getProcessEnv("CONFLUX_RPC_URL"),
    privateKey: getProcessEnv("CONFLUX_PRIVATE_KEY"),
    to: getProcessEnv("CONFLUX_TO"),
  },
  ethereum: {
    rpcUrl: getProcessEnv("ETHEREUM_RPC_URL"),
    privateKey: getProcessEnv("ETHEREUM_PRIVATE_KEY"),
    to: getProcessEnv("ETHEREUM_TO"),
  },
  confluxevmtestnet: {
    rpcUrl: getProcessEnv("CONFLUX_TESTNET_ESPACE_RPC_URL"),
    privateKey: getProcessEnv("CONFLUX_TESTNET_ESPACE_PRIVATE_KEY"),
    to: getProcessEnv("CONFLUX_TESTNET_ESPACE_TO"),
  },
};

const CHAINS = Object.keys(NETWORKS);

function getAccount(chain) {
  if (!CHAINS.includes(chain)) {
    throw new Error(`chain ${chain} not supported`);
  }

  const network = NETWORKS[chain];
  const wallet = new ethers.Wallet(
    network.privateKey,
    new ethers.providers.JsonRpcProvider(network.rpcUrl)
  );
  const to = network.to;

  return { wallet, to };
}

async function send(chain, message) {
  const data = ethers.utils.toUtf8Bytes(message);

  const { wallet, to } = getAccount(chain);

  const tx = {
    to,
    data,
    value: ethers.utils.parseEther("0"),
  };

  const transaction = await wallet.sendTransaction(tx);
  const { transactionHash, blockNumber, ...others } = await transaction.wait();

  const { timestamp } = await wallet.provider.getBlock(blockNumber);

  return { hash: transactionHash, timestamp, message, chain };
}

function isFreeTrailChain(chain) {
  return chain === "confluxevmtestnet";
}

module.exports = {
  send,
  isFreeTrailChain,
  NETWORKS,
};
