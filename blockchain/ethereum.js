const ethers = require("ethers");

const TO = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

function getWallet(chain) {
  if (chain === "conflux") {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://evmtestnet.confluxrpc.com"
    );

    const wallet = new ethers.Wallet(
      "ad2159f97ebef30f920bb7eb863b668832ca51742582d7e8547c556a9df4ad74", // 0xc6c2085C44F1444C40558237d6A82360BA8Da01a
      provider
    );

    return wallet;
  } else if (chain === "ethereum") {
    // TODO
  }
}

async function send(chain, message) {
  const data = ethers.utils.toUtf8Bytes(message);

  const tx = {
    to: TO,
    data,
    // value: ethers.utils.parseEther("0"),
  };

  const wallet = getWallet(chain);

  const transaction = await wallet.sendTransaction(tx);
  const { transactionHash, blockNumber, ...others } = await transaction.wait();

  const { timestamp } = await wallet.provider.getBlock(blockNumber);

  console.log(transactionHash);
  return { hash: transactionHash, timestamp, message, chain };
}

module.exports = {
  send,
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
