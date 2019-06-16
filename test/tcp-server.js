const net = require("net");
function main(port) {
  const p = new Promise(resolve => {
    const server = net.createServer(socket => {
      socket.on("data", msg => {
        console.log("tcp server receive");
        console.log(msg.toString("utf8"));

        socket.write(Buffer.from(new Date().toString(), "utf-8"));
      });
    });

    server.listen(port, () => {
      console.log("tcp server listening", port);
      resolve();
    });
  });

  return p;
}

module.exports = main;
