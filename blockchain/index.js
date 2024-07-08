const ethers = require("ethers");

const TO = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

const provider = new ethers.providers.JsonRpcProvider(
  "https://evmtestnet.confluxrpc.com"
);
// const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

const wallet = new ethers.Wallet(
  "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
  provider
);

async function send(msg) {
  const data = ethers.utils.toUtf8Bytes(msg);

  const tx = {
    to: TO,
    data,
    // value: ethers.utils.parseEther("0"),
  };

  const transaction = await wallet.sendTransaction(tx);
  const { transactionHash } = await transaction.wait();

  console.log(transactionHash);
  return transactionHash;
}

module.exports = {
  send,
};

// async function main() {
//   const tx = {
//     to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
//     // value: ethers.utils.parseEther("0"),
//     data: "0x4554482070726963652069732033303030",
//   };

//   // console.log(await wallet.getBalance());
//   // console.log(await wallet.getTransactionCount());

//   const t = await wallet.sendTransaction(tx);
//   const { transactionHash } = await t.wait();

//   console.log(t, transactionHash);
// }

// main().catch(console.log);
