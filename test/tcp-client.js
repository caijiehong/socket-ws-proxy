const net = require("net");
function main(host, port) {
  const p = new Promise(resolve => {
    const socket = net.connect(
      {
        host,
        port
      },
      () => {
        console.log("tcp client connect to", `${host}:${port}`);

        resolve(socket);
      }
    );
  });

  return p;
}

module.exports = main;
