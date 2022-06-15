// const hre = require("hardhat");
const ethers = require("ethers");
const EventAbi = require("../artifacts/contracts/EventContract.sol/EventContract.json");

async function main() {
  console.log("ZAP");
  const event = "0x99b8cC5B80a79d658513a9DF117320f4AE46Bb01";
  const provider = new ethers.providers.WebSocketProvider(
    "wss://astar.blastapi.io/b47d84b0-7653-4de0-83ab-b71dbefe61f7",
    { chainId: 592, name: "astar" }
  );
  const contract = new ethers.Contract(event, EventAbi.abi, provider);

  contract.on("TestEvent1", (sender, counter, timestamp) => {
    console.log("ZAPP 1");
    console.log(sender, counter, timestamp);
  });

  contract.on("TestEvent2", (sender, counter, timestamp) => {
    console.log("ZAPP 2");
    console.log(sender, counter, timestamp);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
