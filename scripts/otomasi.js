const { ethers } = require("hardhat");
const {
  abi: abi1,
} = require("../artifacts/contracts/AnotherContract.sol/AnotherContract.json");
const {
  abi: abi2,
} = require("../artifacts/contracts/EventContract.sol/EventContract.json");
const scheaduler = require("node-schedule");

async function main() {
  const [account1, account2] = await ethers.getSigners();
  const address1 = "0x99b8cC5B80a79d658513a9DF117320f4AE46Bb01";
  const address2 = "0x0e460fAF94Cd5838b56CE555b55C328784e41305";
  const contract1 = new ethers.Contract(address1, abi1, account1);
  scheaduler.scheduleJob("* * * * *", async () => {
    const sendTx1 = await contract1.execEvent1();
    await sendTx1.wait();
    console.log("Exec Event 1 SC 1 hash: ", sendTx1.hash);

    const sendTx2 = await contract1.execEvent2();
    await sendTx2.wait();
    console.log("Exec Event 2 SC 1 hash: ", sendTx2.hash);
  });
  const contract2 = new ethers.Contract(address2, abi2, account2);
  scheaduler.scheduleJob("* * * * *", async () => {
    const sendTx1 = await contract2.connect(account2).execEvent1();
    await sendTx1.wait();
    console.log("Exec Event 1 SC 2 hash: ", sendTx1.hash);

    const sendTx2 = await contract2.connect(account2).execEvent2();
    await sendTx2.wait();
    console.log("Exec Event 2 SC 2 hash: ", sendTx2.hash);
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
