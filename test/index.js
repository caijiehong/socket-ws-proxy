const { Server, Client } = require("../index");
const TcpServer = require("./tcp-server");
const TcpClient = require("./tcp-client");

async function main() {
  await Server(8801);

  const opt = {
    localPort: 8802,
    wsProxyHost: "ws://127.0.0.1:8801",
    destHost: "127.0.0.1",
    destPort: 8803
    // agent: "http://127.0.0.1:8081"
  };
  await Client(opt);

  await TcpServer(opt.destPort);

  const socket = await TcpClient("127.0.0.1", opt.localPort);

  socket.write(Buffer.from("abcd", "utf-8"));

  socket.on("data", msg => {
    console.log("tcp client receive");
    console.log(msg.toString("utf8"));
  });
}

main();
