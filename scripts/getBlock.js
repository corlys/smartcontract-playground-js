const { ethers } = require("hardhat");
const scheaduler = require("node-schedule");

async function main() {
  let currentBlockNumber = 1248239;
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ASTAR_PROVIDER,
    { chainId: 592, name: "astar" }
  );

  scheaduler.scheduleJob("*/1 * * * *", async () => {
    // const recentlyMinedBlock = await provider.getBlockNumber();
    console.log("I ran now");
    const getBlockWithTxs = await provider.getBlockWithTransactions(
      currentBlockNumber
    );
    const txs = getBlockWithTxs.transactions;
    // console.log(`txs on block ${currentBlockNumber} : ${txs}`);
    if (txs.length !== 0) {
      for (let index = 0; index < txs.length; index++) {
        const receipt = await provider.getTransactionReceipt(txs[index].hash);
        const logs = receipt.logs;
        // console.log(txs[index].hash);
        if (
          txs[index].hash ===
          "0x66c2ae310edfe126d2d2f9444ac12a43c0d06d465ab8b8f5e4f2488fe3c7fde2"
        ) {
          console.log("found ya jukiverse");
          console.log(logs);
        }
        if (logs.length !== 0) {
          for (let i = 0; i < logs.length; i++) {
            try {
              // console.log(logs[i]);
              const contractAddress = logs[i].address;
              const data = logs[i].data;
              const topics = logs[i].topics;
              const log = {
                data,
                topics,
              };
              const abi = [
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
              ];
              const iface = new ethers.utils.Interface(abi);
              const decodedLog = iface.parseLog(log);
              console.log(decodedLog.args);
              console.log(`Contract Address : ${contractAddress}`);
            } catch (error) {
              // console.log(error);
            }
          }
        }
      }
    }
    currentBlockNumber++;
  });
}

// async function main() {
//   // const [signer] = await ethers.getSigners();
//   const provider = new ethers.providers.JsonRpcProvider(
//     process.env.ASTAR_PROVIDER,
//     { chainId: 592, name: "astar" }
//   );

//   const blockNumber = 1251917;

//   const getBlockWithTxs = await provider.getBlockWithTransactions(blockNumber);
//   const txs = getBlockWithTxs.transactions;

//   txs.map(async (tx) => {
//     // NOTE: address nya mas andy
//     if (tx.from === "0x9209a04a5bebdc068D0632EC828Ed597364ce3E6") {
//       const receipt = await provider.getTransactionReceipt(tx.hash);
//       const logs = receipt.logs;
//       logs.map((log) => {
//         try {
//           const data = log.data;
//           const topics = log.topics;
//           const logObject = {
//             data,
//             topics,
//           };
//           const abi = ["event Mint(address indexed minter, uint256 amount)"];
//           const iface = new ethers.utils.Interface(abi);
//           const decodedLog = iface.parseLog(logObject);
//           console.log(decodedLog);
//           return decodedLog;
//         } catch (error) {
//           console.log("ABI does not match to the ABI event");
//           return null;
//         }
//       });
//     }
//   });

//   // console.log(getBlockWithTxs);
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
