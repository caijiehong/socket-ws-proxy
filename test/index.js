const { Server, Client } = require("../index");
const TcpServer = require("./tcp-server");
const TcpClient = require("./tcp-client");

async function main() {
  const opt = {
    localPort: 8802,
    wsProxyHost: "http://127.0.0.1:8801",
    destHost: "127.0.0.1",
    destPort: 8803,
    agent: "http://127.0.0.1:8081"
  };
  await Server(8801);

  await TcpServer(opt.destPort);

  await Client(opt);

  const socket = await TcpClient("127.0.0.1", opt.localPort);

  socket.write(Buffer.from("abcd", "utf-8"));

  socket.on("data", msg => {
    console.log("tcp client receive");
    console.log(msg.toString("utf8"));
  });
}

main();
