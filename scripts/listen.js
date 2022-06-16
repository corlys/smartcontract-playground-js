// const hre = require("hardhat");
const ethers = require("ethers");
const EventAbi = require("../artifacts/contracts/EventContract.sol/EventContract.json");
const EventAbiTwo = require("../artifacts/contracts/AnotherContract.sol/AnotherContract.json");

async function main() {
  const event1 = "0x99b8cC5B80a79d658513a9DF117320f4AE46Bb01";
  const event2 = "0x0e460fAF94Cd5838b56CE555b55C328784e41305";
  const provider = new ethers.providers.WebSocketProvider(
    "wss://astar.blastapi.io/b47d84b0-7653-4de0-83ab-b71dbefe61f7",
    { chainId: 592, name: "astar" }
  );
  const contract = new ethers.Contract(event1, EventAbi.abi, provider);
  const contractTwo = new ethers.Contract(event2, EventAbiTwo.abi, provider);

  contract.on("TestEvent1", (sender, counter, timestamp) => {
    console.log("Event TestEvent1");
    console.log(`sender : ${sender}`);
    console.log(`counter : ${counter}`);
    console.log(`date : ${new Date(timestamp.toNumber() * 1000).toJSON()}\n`);
  });

  contract.on("TestEvent2", (sender, counter, timestamp) => {
    console.log("Event TestEvent2");
    console.log(`sender : ${sender}`);
    console.log(`counter : ${counter}`);
    console.log(`date : ${new Date(timestamp.toNumber() * 1000).toJSON()}\n`);
  });

  contractTwo.on("AnotherEvent1", (sender, counter, timestamp) => {
    console.log("Event AnotherEvent1");
    console.log(`sender : ${sender}`);
    console.log(`counter : ${counter}`);
    console.log(`date : ${new Date(timestamp.toNumber() * 1000).toJSON()}\n`);
  });

  contractTwo.on("AnotherEvent2", (sender, counter, timestamp) => {
    console.log("Event AnotherEvent2");
    console.log(`sender : ${sender}`);
    console.log(`counter : ${counter}`);
    console.log(`date : ${new Date(timestamp.toNumber() * 1000).toJSON()}\n`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
