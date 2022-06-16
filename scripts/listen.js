// const hre = require("hardhat");
const ethers = require("ethers");
const EventAbi = require("../artifacts/contracts/EventContract.sol/EventContract.json");
const EventAbiTwo = require("../artifacts/contracts/AnotherContract.sol/AnotherContract.json");

const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 7500;

const startConnection = () => {
  const provider = new ethers.providers.WebSocketProvider(
    "wss://astar.blastapi.io/b47d84b0-7653-4de0-83ab-b71dbefe61f7",
    { chainId: 592, name: "astar" }
  );

  let pingTimeout = null;
  let keepAliveInterval = null;
  const event1 = "0x99b8cC5B80a79d658513a9DF117320f4AE46Bb01";
  const event2 = "0x0e460fAF94Cd5838b56CE555b55C328784e41305";
  const contract = new ethers.Contract(event1, EventAbi.abi, provider);
  const contractTwo = new ethers.Contract(event2, EventAbiTwo.abi, provider);

  provider._websocket.on("open", () => {
    console.log("I was made at ", new Date().toJSON());
    keepAliveInterval = setInterval(() => {
      // console.log("Checking if the connection is alive, sending a ping");

      provider._websocket.ping();

      // Use `WebSocket#terminate()`, which immediately destroys the connection,
      // instead of `WebSocket#close()`, which waits for the close timer.
      // Delay should be equal to the interval at which your server
      // sends out pings plus a conservative assumption of the latency.
      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, EXPECTED_PONG_BACK);
    }, KEEP_ALIVE_CHECK_INTERVAL);

    // TODO: handle contract listeners setup + indexing

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
  });

  provider._websocket.on("close", () => {
    console.log("The websocket connection was closed");
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    contract.removeAllListeners();
    startConnection();
  });

  provider._websocket.on("pong", () => {
    // console.log("Received pong, so connection is alive, clearing the timeout");
    clearInterval(pingTimeout);
  });
};

// async function main() {
//   try {
//     const event1 = "0x99b8cC5B80a79d658513a9DF117320f4AE46Bb01";
//     const event2 = "0x0e460fAF94Cd5838b56CE555b55C328784e41305";
//     const provider = startConnection();
//     const contract = new ethers.Contract(event1, EventAbi.abi, provider);
//     const contractTwo = new ethers.Contract(event2, EventAbiTwo.abi, provider);

//     contract.on("TestEvent1", (sender, counter, timestamp) => {
//       console.log("Event TestEvent1");
//       console.log(`sender : ${sender}`);
//       console.log(`counter : ${counter}`);
//       console.log(`date : ${new Date(timestamp.toNumber() * 1000).toJSON()}\n`);
//     });

//     contract.on("TestEvent2", (sender, counter, timestamp) => {
//       console.log("Event TestEvent2");
//       console.log(`sender : ${sender}`);
//       console.log(`counter : ${counter}`);
//       console.log(`date : ${new Date(timestamp.toNumber() * 1000).toJSON()}\n`);
//     });

//     contractTwo.on("AnotherEvent1", (sender, counter, timestamp) => {
//       console.log("Event AnotherEvent1");
//       console.log(`sender : ${sender}`);
//       console.log(`counter : ${counter}`);
//       console.log(`date : ${new Date(timestamp.toNumber() * 1000).toJSON()}\n`);
//     });

//     contractTwo.on("AnotherEvent2", (sender, counter, timestamp) => {
//       console.log("Event AnotherEvent2");
//       console.log(`sender : ${sender}`);
//       console.log(`counter : ${counter}`);
//       console.log(`date : ${new Date(timestamp.toNumber() * 1000).toJSON()}\n`);
//     });
//   } catch (error) {
//     console.log(
//       "Somethings wrong inside of try catch, here's the message : ",
//       error
//     );
//     throw new Error(error);
//   }
// }

// main().catch((error) => {
//   console.log(
//     "Somethings wrong inside of main method, here's the message : ",
//     error
//   );
//   // console.error(error);
//   process.exitCode = 1;
// });

startConnection();
