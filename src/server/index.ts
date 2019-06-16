import * as WebSocket from "ws";
import * as Url from "url";
import * as Qs from "querystring";
import * as net from "net";

function main(port: number) {
  const p = new Promise<WebSocket.Server>(resolve => {
    const wss = new WebSocket.Server({ port }, () => {
      console.log("proxy sever listenting", port);

      resolve(wss);
    });

    wss.on("connection", function connection(ws, req) {
      console.log("proxy server connection", req.url);

      const url = Url.parse(req.url);
      const qs = Qs.parse(url.query) as {
        destHost: string;
        destPort: string;
      };
      const tmpBuffer: Buffer[] = [];

      const socket = net.connect(
        {
          host: qs.destHost,
          port: parseInt(qs.destPort, 10)
        },
        () => {
          console.log("proxy server connect to tcp server");

          let tmp: Buffer;
          while ((tmp = tmpBuffer.pop())) {
            socket.write(tmp);
          }
          socket.on("data", data => {
            ws.send(data);
          });
        }
      );

      ws.on("message", function incoming(message: Buffer) {
        console.log("proxy server recevice", [message, socket.connecting]);

        if (!socket.connecting) {
          socket.write(message);
        } else {
          tmpBuffer.push(message);
        }
      });
    });

    return wss;
  });

  return p;
}

module.exports = main;
