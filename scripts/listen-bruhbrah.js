// const hre = require("hardhat");
const ethers = require("ethers");
const { abi } = require("../artifacts/contracts/BruhBrah.sol/BruhBrah.json");
const axios = require("axios").default;

const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 7500;

const startConnection = () => {
  const provider = new ethers.providers.WebSocketProvider(
    "wss://eth-rinkeby.alchemyapi.io/v2/YCOTIvCgVpFMaVkDpe6ZiRabb8Vu9z-_",
    "rinkeby"
  );

  let pingTimeout = null;
  let keepAliveInterval = null;
  let aliveTime = null;
  let deadTime = null;
  const bruhBrahAddress = "0xAF04e8d31D341b05a614ABA5D4858401e7e8C6e6";
  // const event2 = "0x0e460fAF94Cd5838b56CE555b55C328784e41305";
  const contract = new ethers.Contract(bruhBrahAddress, abi, provider);
  // const contractTwo = new ethers.Contract(event2, EventAbiTwo.abi, provider);

  provider._websocket.on("open", () => {
    aliveTime = new Date();
    console.log("I was made at ", aliveTime.toJSON());
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

    // contract.on("Mint", async (to, amount, log) => {
    //   console.log("Event Mint");
    //   console.log(`to : ${to}`);
    //   console.log(`amount : ${amount}\n`);

    //   // {
    //   //   "transaction_id": <string>,
    //   //   "amount": <integer>,
    //   //   "from": <string>,
    //   //   "to": <string>
    //   // }

    //   const data = {
    //     transaction_id: log?.transactionHash,
    //     amount,
    //     to,
    //     from: "",
    //   };

    //   console.log("zap", data);

    //   await axios.post(
    //     "https://us-central1-cosmo-customize.cloudfunctions.net/app/test/transactionLog",
    //     data
    //   );

    //   // tracking token ownership
    //   // fetch token by tokenId =>
    //   // # kalau docs nya ga ada dia kita masukin dengan buat row baru, creator dan
    //   // owner field dapet dari `to`
    //   // # kalau docs ada cukup ganti owner nya menjadi yang to

    //   // tracking user
    //   // get user dengan parameter to, jika dapet di docs biarkan, jika tidak bikin row
    //   // baru buat user
    // });

    contract.on("Transfer", async (from, to, tokenId, logReceipt) => {
      console.log("Event Transfer");

      // {
      //   "transaction_id": <string>,
      //   "amount": <integer>,
      //   "from": <string>,
      //   "to": <string>
      // }

      const data = {
        transaction_id: logReceipt?.transactionHash,
        amount: 1,
        to,
        from,
        tokenId: tokenId.toNumber(),
      };

      console.log(data);

      await axios.post(
        "https://us-central1-cosmo-customize.cloudfunctions.net/app/test/transactionLog",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // tracking token ownership
      // fetch token by tokenId =>
      // # kalau docs nya ga ada dia kita masukin dengan buat row baru, creator dan
      // owner field dapet dari `to`
      // # kalau docs ada cukup ganti owner nya menjadi yang to

      // tracking user
      // get user dengan parameter to, jika dapet di docs biarkan, jika tidak bikin row
      // baru buat user
    });
  });

  provider._websocket.on("close", () => {
    deadTime = new Date();
    const difference = Math.abs(deadTime - aliveTime);
    console.log("The websocket connection was closed at ", deadTime.toJSON());
    console.log(
      `Difference between deadTime and aliveTime is ${difference} ms`
    );
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

startConnection();
