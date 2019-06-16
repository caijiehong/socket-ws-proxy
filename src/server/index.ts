import * as IO from "socket.io";
import * as Url from "url";
import * as Qs from "querystring";
import * as net from "net";

function main(port: number) {
  const p = new Promise<WebSocket.Server>(resolve => {
    const io = IO();
    io.on("connection", client => {
      const url = Url.parse(client.request.url);
      const qs = Qs.parse(url.query) as {
        destHost: string;
        destPort: string;
      };

      const socket = net.connect(
        {
          host: qs.destHost,
          port: parseInt(qs.destPort, 10)
        },
        () => {
          console.log("proxy server connect to tcp server");
          socket.on("data", data => {
            client.emit("res", data);
          });
        }
      );

      client.on("req", data => {
        socket.write(data);
      });
    });
    io.listen(port);

    resolve();
  });

  return p;
}

module.exports = main;
