const ethers = require("ethers");

require("dotenv").config();

// TODO 以太坊和 fork 的链共用一个私钥
// 后期要考虑一下是用 EOA 还是合约地址
const NETWORKS = {
  conflux: {
    rpcUrl: process.env.CONFLUX_RPC_URL,
    privateKey: process.env.CONFLUX_PRIVATE_KEY,
    to: process.env.CONFLUX_TO,
  },
  ethereum: {
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    privateKey: process.env.ETHEREUM_PRIVATE_KEY,
    to: process.env.ETHEREUM_TO,
  },
  confluxevmtestnet: {
    rpcUrl: process.env.CONFLUX_TESTNET_ESPACE_RPC_URL,
    privateKey: process.env.CONFLUX_TESTNET_ESPACE_PRIVATE_KEY,
    to: process.env.CONFLUX_TESTNET_ESPACE_TO,
  },
};

const CHAINS = Object.keys(NETWORKS);

function getAccount(chain) {
  try {
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
  } catch (e) {
    throw e;
  }
}

async function send(chain, message) {
  try {
    const data = ethers.utils.toUtf8Bytes(message);

    const { wallet, to } = getAccount(chain);

    const tx = {
      to,
      data,
      // value: ethers.utils.parseEther("0"),
    };

    const transaction = await wallet.sendTransaction(tx);
    const { transactionHash, blockNumber, ...others } =
      await transaction.wait();

    const { timestamp } = await wallet.provider.getBlock(blockNumber);

    // console.log(transactionHash);
    return { hash: transactionHash, timestamp, message, chain };
  } catch (e) {
    throw e;
  }
}

function isFreeTrailChain(chain) {
  return chain === "confluxevmtestnet";
}

module.exports = {
  send,
  isFreeTrailChain,
  NETWORKS,
};

// async function main() {
//   // const tx = {
//   //   to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
//   //   // value: ethers.utils.parseEther("0"),
//   //   data: "0x4554482070726963652069732033303030",
//   // };
//   // // console.log(await wallet.getBalance());
//   // // console.log(await wallet.getTransactionCount());
//   // const t = await wallet.sendTransaction(tx);
//   // const resp = await t.wait();
//   // console.log(t, resp);
//   // console.log(await provider.getBlock(178817225));
// }

// main().catch(console.log);
