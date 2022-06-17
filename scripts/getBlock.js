const { ethers } = require("hardhat");

async function main() {
  // const [signer] = await ethers.getSigners();
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ASTAR_PROVIDER,
    { chainId: 592, name: "astar" }
  );

  const blockNumber = 1251917;

  const getBlockWithTxs = await provider.getBlockWithTransactions(blockNumber);
  const txs = getBlockWithTxs.transactions;

  txs.map(async (tx) => {
    // NOTE: address nya mas andy
    if (tx.from === "0x9209a04a5bebdc068D0632EC828Ed597364ce3E6") {
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const logs = receipt.logs;
      logs.map((log) => {
        try {
          const data = log.data;
          const topics = log.topics;
          const logObject = {
            data,
            topics,
          };
          const abi = ["event Mint(address indexed minter, uint256 amount)"];
          const iface = new ethers.utils.Interface(abi);
          const decodedLog = iface.parseLog(logObject);
          console.log(decodedLog);
          return decodedLog;
        } catch (error) {
          console.log("ABI does not match to the ABI event");
          return null;
        }
      });
    }
  });

  // console.log(getBlockWithTxs);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
